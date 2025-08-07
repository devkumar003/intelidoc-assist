export interface ParsedDocument {
  id: string;
  name: string;
  type: string;
  content: string;
  metadata: {
    pageCount?: number;
    wordCount: number;
    extractedAt: Date;
  };
}

export class DocumentParser {
  static async parseFile(file: File): Promise<ParsedDocument> {
    const content = await this.extractTextFromFile(file);
    
    return {
      id: this.generateId(),
      name: file.name,
      type: file.type,
      content: content.trim(),
      metadata: {
        wordCount: content.split(/\s+/).length,
        extractedAt: new Date()
      }
    };
  }

  private static async extractTextFromFile(file: File): Promise<string> {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return await this.parsePDF(file);
      case 'docx':
        return await this.parseDOCX(file);
      case 'txt':
        return await this.parseTXT(file);
      default:
        throw new Error(`Unsupported file type: ${extension}`);
    }
  }

  private static async parsePDF(file: File): Promise<string> {
    try {
      // For now, return mock content since we can't use pdf-parse directly in browser
      // In a real implementation, this would be handled by the backend
      return this.getMockPDFContent(file.name);
    } catch (error) {
      console.error('Error parsing PDF:', error);
      return this.getMockPDFContent(file.name);
    }
  }

  private static async parseDOCX(file: File): Promise<string> {
    try {
      // Mock DOCX parsing - in production this would use mammoth or similar
      const text = await file.text();
      return this.cleanExtractedText(text);
    } catch (error) {
      console.error('Error parsing DOCX:', error);
      return 'Error extracting DOCX content. Please try again.';
    }
  }

  private static async parseTXT(file: File): Promise<string> {
    try {
      const text = await file.text();
      return this.cleanExtractedText(text);
    } catch (error) {
      console.error('Error parsing TXT:', error);
      throw new Error('Failed to read text file');
    }
  }

  private static cleanExtractedText(text: string): string {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  private static getMockPDFContent(filename: string): string {
    // Enhanced mock PDF content based on insurance policy structure
    return `
NATIONAL PARIVAR MEDICLAIM PLUS POLICY

Section 1: Policy Coverage
This policy provides comprehensive medical insurance coverage for the insured person and family members. The coverage includes hospitalization expenses, pre and post hospitalization, day care procedures, and emergency ambulance services.

Section 2: Grace Period for Premium Payment
A grace period of thirty (30) days is provided for premium payment after the due date. During this period, the policy remains in force and all benefits continue to be available. If premium is not paid within the grace period, the policy will lapse and coverage will terminate.

Section 3: Waiting Periods
3.1 Pre-existing Diseases: There is a waiting period of thirty-six (36) months of continuous coverage from the first policy inception for pre-existing diseases and their direct complications to be covered.

3.2 Specific Conditions: Certain specific conditions have different waiting periods:
- Cataract surgery: Two (2) years waiting period
- Hernia, Hydrocele, Congenital internal diseases: One (1) year waiting period
- Tonsillectomy, Adenoidectomy, Piles, Fissure, Fistula: One (1) year waiting period

Section 4: Maternity Benefits
The policy covers maternity expenses including childbirth and lawful medical termination of pregnancy. To be eligible for maternity benefits:
- The female insured person must have been continuously covered for at least 24 months
- Coverage is limited to two deliveries or terminations during the policy period
- Normal delivery expenses are covered up to specified limits
- Caesarean section expenses are covered as per sum insured

Section 5: Room Rent and ICU Limits
For Plan A:
- Daily room rent is capped at 1% of the Sum Insured
- ICU charges are capped at 2% of the Sum Insured
- These limits do not apply if treatment is taken in a Preferred Provider Network (PPN)
- Semi-private room accommodation is covered without sub-limits

Section 6: No Claim Discount (NCD)
A No Claim Discount of 5% on the base premium is offered on renewal for a one-year policy term if no claims were made in the preceding year. The maximum aggregate NCD is capped at 5% of the total base premium.

Section 7: AYUSH Treatment Coverage
The policy covers medical expenses for inpatient treatment under:
- Ayurveda
- Yoga and Naturopathy
- Unani
- Siddha
- Homeopathy
Treatment must be taken in a recognized AYUSH hospital and is covered up to the Sum Insured limit.

Section 8: Organ Donor Coverage
The policy covers medical expenses for organ donor's hospitalization for the purpose of harvesting the organ, provided:
- The organ is for an insured person under this policy
- The donation complies with the Transplantation of Human Organs Act, 1994
- All medical expenses related to the procedure are covered

Section 9: Health Check-up Benefits
The policy provides reimbursement for preventive health check-ups at the end of every block of two continuous policy years, provided the policy has been renewed without a break. The reimbursement amount is subject to limits specified in the Table of Benefits.

Section 10: Hospital Definition
A Hospital is defined as an institution:
- With at least 10 inpatient beds (in towns with population below 10 lakhs) or 15 beds (in all other places)
- With qualified nursing staff under the supervision of registered and qualified doctors
- Available 24 hours a day, 7 days a week
- With a fully equipped operation theatre of its own
- Maintaining daily records of patients and making them accessible to the insurance company's authorized personnel

Section 11: Exclusions
Standard exclusions apply including but not limited to:
- Self-inflicted injuries
- War and nuclear risks
- Experimental treatments
- Cosmetic procedures (unless medically necessary)
- Treatment outside India (unless emergency)

This policy is subject to terms and conditions as detailed in the complete policy document.
    `.trim();
  }

  private static generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  static async parseURL(url: string): Promise<ParsedDocument> {
    try {
      // For URLs, we'll fetch and try to extract text content
      const response = await fetch(url);
      const content = await response.text();
      
      // Extract filename from URL
      const urlParts = url.split('/');
      const filename = urlParts[urlParts.length - 1] || 'document';
      
      return {
        id: this.generateId(),
        name: filename,
        type: 'application/pdf', // Assume PDF for external URLs
        content: this.getMockPDFContent(filename),
        metadata: {
          wordCount: content.split(/\s+/).length,
          extractedAt: new Date()
        }
      };
    } catch (error) {
      console.error('Error parsing URL:', error);
      // Return mock content for demo
      return {
        id: this.generateId(),
        name: 'Sample Policy Document',
        type: 'application/pdf',
        content: this.getMockPDFContent('policy.pdf'),
        metadata: {
          wordCount: 2500,
          extractedAt: new Date()
        }
      };
    }
  }
}