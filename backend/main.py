
# backend/main.py
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Any
from pathlib import Path
import tempfile
import shutil
import os
import faiss
import numpy as np
import openai

# Initialize app
tmp_dir = tempfile.gettempdir()
app = FastAPI()

# CORS setup for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Config
openai.api_key = os.getenv("OPENAI_API_KEY")
EMBEDDING_MODEL = "text-embedding-ada-002"
CHUNK_SIZE = 500

# In-memory store
vector_index = None
metadata_store = []

async def save_upload(file: UploadFile) -> str:
    suffix = Path(file.filename).suffix
    dest = Path(tmp_dir) / (file.filename)
    with open(dest, "wb") as f:
        shutil.copyfileobj(file.file, f)
    return str(dest)

async def read_text(path: str) -> str:
    from pdfminer.high_level import extract_text
    from docx import Document
    text = ""
    if path.lower().endswith('.pdf'):
        text = extract_text(path)
    elif path.lower().endswith('.docx'):
        doc = Document(path)
        text = "\n".join([p.text for p in doc.paragraphs])
    else:
        raise HTTPException(status_code=400, detail="Unsupported file type")
    return text

def chunk_text(text: str) -> List[str]:
    chunks = []
    for i in range(0, len(text), CHUNK_SIZE):
        chunks.append(text[i:i + CHUNK_SIZE])
    return chunks

def build_faiss_index(embeddings: List[List[float]]):
    dim = len(embeddings[0])
    index = faiss.IndexFlatIP(dim)
    index.add(np.array(embeddings).astype('float32'))
    return index

class QueryRequest(BaseModel):
    question: str

class QueryResponse(BaseModel):
    question: str
    answer: str
    source_clause: str
    confidence: float

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    path = await save_upload(file)
    text = await read_text(path)
    chunks = chunk_text(text)
    resp = openai.Embedding.create(
        model=EMBEDDING_MODEL,
        input=chunks
    )
    embeddings = [e['embedding'] for e in resp['data']]
    global vector_index, metadata_store
    vector_index = build_faiss_index(embeddings)
    metadata_store = [{'id': i, 'text': chunks[i]} for i in range(len(chunks))]
    return {"status": "indexed", "chunks": len(chunks)}

@app.post("/query", response_model=List[QueryResponse])
async def query_document(req: QueryRequest):
    if vector_index is None:
        raise HTTPException(status_code=400, detail="No document indexed")
    q_emb = openai.Embedding.create(
        model=EMBEDDING_MODEL,
        input=[req.question]
    )['data'][0]['embedding']
    q_vec = np.array(q_emb).astype('float32').reshape(1, -1)
    D, I = vector_index.search(q_vec, k=3)
    top_idxs = I[0]
    sources = [metadata_store[i]['text'] for i in top_idxs]
    prompt = "\nSources:\n"
    for idx, src in zip(top_idxs, sources):
        prompt += f"[{idx}]: {src}\n"
    prompt += f"\nQuestion: {req.question}\nAnswer concisely with source reference."
    chat = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "system", "content": prompt}]
    )
    ans = chat.choices[0].message.content
    import re
    match = re.search(r"\[(\d+)\]", ans)
    source_idx = int(match.group(1)) if match else top_idxs[0]
    source_clause = metadata_store[source_idx]['text']
    confidence = float(D[0][list(top_idxs).index(source_idx)])
    return [{
        "question": req.question,
        "answer": ans,
        "source_clause": source_clause,
        "confidence": confidence
    }]
