# DATA PROCESSING AGREEMENT (DPA)

**Between:**
- **Data Controller:** [Customer Company Name] ("Customer")
- **Data Processor:** FinaclyAI Inc. ("Processor")

**Effective Date:** [Date]

**Governing Agreement:** FinaclyAI Terms of Service

---

## 1. DEFINITIONS

**"Personal Data"** means any information relating to an identified or identifiable natural person processed by Processor on behalf of Controller.

**"Processing"** means any operation performed on Personal Data, including collection, storage, use, disclosure, or deletion.

**"Sub-processor"** means any third party engaged by Processor to process Personal Data.

**"Data Subject"** means an identified or identifiable natural person to whom Personal Data relates.

**"GDPR"** means the EU General Data Protection Regulation 2016/679.

**"Applicable Law"** means all applicable data protection and privacy laws, including GDPR, CCPA, PIPEDA.

---

## 2. SCOPE AND PURPOSE

### 2.1 Scope
This DPA applies to Processor's processing of Personal Data on behalf of Controller in connection with the FinaclyAI automated reconciliation service.

### 2.2 Purpose
Personal Data is processed solely for:
- Automated reconciliation of Stripe payouts with bank deposits and QuickBooks entries
- Detection of reconciliation exceptions
- Generation of QuickBooks deposit entries
- Provision of analytics and reporting

### 2.3 Duration
This DPA remains in effect for the duration of the FinaclyAI service agreement.

---

## 3. DATA CATEGORIES AND SUBJECTS

### 3.1 Categories of Data Subjects
- Business owners and authorized employees
- Customers who make payments via Stripe
- Vendors and contractors (limited)

### 3.2 Categories of Personal Data
- **Contact Information:** Names, email addresses, phone numbers
- **Financial Data:** Transaction amounts, dates, bank account details (last 4 digits only)
- **Business Data:** Company names, addresses, tax IDs
- **Usage Data:** Login times, IP addresses, activity logs

### 3.3 Special Categories
Processor does NOT process special categories of data (health, biometric, political opinions, etc.) under this agreement.

---

## 4. PROCESSOR OBLIGATIONS

### 4.1 Instructions
Processor shall process Personal Data only on documented instructions from Controller, including transfers to third countries.

### 4.2 Confidentiality
Processor ensures that persons authorized to process Personal Data:
- Have committed to confidentiality or are under statutory confidentiality obligations
- Receive appropriate training on data protection

### 4.3 Security Measures
Processor implements technical and organizational measures including:
- Encryption of data in transit (TLS 1.3) and at rest
- Access controls and authentication
- Regular security assessments
- Incident detection and response procedures
- Data backup and recovery capabilities
- Audit logging of all access and modifications

### 4.4 Sub-processors
Current sub-processors:
- **Vercel Inc.** - Hosting and infrastructure (SOC 2, ISO 27001)
- **[Database Provider]** - Database hosting (specify: Supabase, AWS, etc.)
- **Stripe Inc.** - Payment processing (PCI DSS Level 1)
- **Plaid Inc.** - Bank data aggregation (SOC 2)
- **Intuit Inc.** - QuickBooks integration (SOC 2, ISO 27001)

Controller authorizes use of the sub-processors listed above. Processor will:
- Notify Controller of any changes to sub-processors (30 days advance notice)
- Ensure sub-processors comply with equivalent data protection obligations
- Remain liable for sub-processor compliance

### 4.5 Data Subject Rights
Processor shall assist Controller in responding to Data Subject requests:
- Access requests (within 30 days)
- Rectification requests (immediate)
- Erasure requests (within 90 days)
- Data portability (JSON export format)
- Objection to processing (immediate cessation)

### 4.6 Data Breach Notification
In the event of a Personal Data breach, Processor shall:
- Notify Controller without undue delay (target: 24 hours)
- Provide details: nature, affected data, potential consequences, mitigation measures
- Assist Controller with regulatory notification (if required within 72 hours)
- Document all breaches in incident log

---

## 5. CONTROLLER OBLIGATIONS

Controller warrants that:
- It has lawful basis for processing under Applicable Law
- It has obtained necessary consents from Data Subjects
- It provides accurate instructions to Processor
- It monitors Processor's compliance with this DPA

---

## 6. INTERNATIONAL DATA TRANSFERS

### 6.1 Transfer Mechanism
Personal Data may be transferred to the United States. Transfers are protected by:
- Standard Contractual Clauses (EU Commission approved)
- Supplementary measures (encryption, access controls)
- Data Processing Impact Assessments where required

### 6.2 Adequacy
Controller acknowledges that the United States does not have an adequacy decision under GDPR. Processor implements additional safeguards through:
- Encryption in transit and at rest
- Strict access controls
- Audit logging
- Data residency options (available for enterprise)

---

## 7. DATA RETENTION AND DELETION

### 7.1 Retention Period
Personal Data will be retained:
- **Active accounts:** Duration of service + 90 days
- **Deleted accounts:** 90-day grace period, then permanent deletion
- **Financial records:** 7 years (tax/legal compliance)
- **Audit logs:** 12 months

### 7.2 Deletion Procedures
Upon termination or deletion request:
1. Personal Data deleted from active systems within 90 days
2. Backup copies deleted within 180 days (backup rotation cycle)
3. Legally required records retained in archived, access-controlled storage
4. Certificate of deletion provided upon request

---

## 8. AUDIT RIGHTS

### 8.1 Controller Audit Rights
Controller (or appointed auditor) may audit Processor's compliance with this DPA upon:
- Reasonable notice (30 days)
- During business hours
- At Controller's expense
- No more than once annually (unless breach suspected)

### 8.2 Processor Documentation
Processor shall maintain and provide upon request:
- Security policies and procedures
- Audit logs
- Sub-processor agreements
- Compliance certifications (SOC 2 when available)
- Incident reports

---

## 9. LIABILITY AND INDEMNIFICATION

### 9.1 Processor Liability
Processor is liable for damages caused by:
- Failure to comply with GDPR obligations
- Acting outside or contrary to Controller's lawful instructions
- Breach of security measures

### 9.2 Indemnification
Processor shall indemnify Controller for:
- Regulatory fines resulting from Processor's non-compliance
- Data Subject claims arising from Processor's breach
- Third-party claims (excluding Controller's own violations)

### 9.3 Limitation
Liability is subject to limitations in the main service agreement, except where prohibited by law.

---

## 10. TERMINATION

### 10.1 Effect of Termination
Upon termination of the service agreement:
- Processor shall cease all processing (except legally required retention)
- Return or delete all Personal Data (at Controller's choice)
- Provide certification of deletion
- Maintain confidentiality obligations

### 10.2 Survival
Confidentiality, liability, and indemnification provisions survive termination.

---

## 11. AMENDMENTS

This DPA may be amended:
- By mutual written agreement
- Automatically to comply with changes in Applicable Law (notification provided)
- To incorporate new Standard Contractual Clauses (with Controller consent)

---

## 12. GOVERNING LAW

This DPA is governed by the laws of [Jurisdiction], except where Applicable Law requires otherwise (e.g., GDPR for EU data).

---

## 13. SIGNATURES

**CONTROLLER:**

**Company:** ___________________________  
**Signatory:** ___________________________  
**Title:** ___________________________  
**Date:** ___________________________

**PROCESSOR:**

**Company:** FinaclyAI Inc.  
**Signatory:** ___________________________  
**Title:** CEO / Data Protection Officer  
**Date:** ___________________________

---

## APPENDIX A: TECHNICAL AND ORGANIZATIONAL MEASURES

### 1. Access Control
- Multi-factor authentication (optional)
- Role-based access control
- Principle of least privilege
- Access logging and monitoring

### 2. Transmission Control
- TLS 1.3 encryption for all data in transit
- Certificate pinning where applicable
- Secure API authentication

### 3. Input Control
- Audit logging of all data modifications
- Version control for code changes
- Change management procedures

### 4. Availability Control
- Daily automated backups
- Point-in-time recovery capability
- Disaster recovery plan
- 99.9% uptime SLA (Vercel platform)

### 5. Separation Control
- Multi-tenant data isolation via ownerId
- Database-level row-level security (when enabled)
- Separate test and production environments

---

## APPENDIX B: SUB-PROCESSORS

| Sub-processor | Purpose | Location | Certifications |
|---------------|---------|----------|----------------|
| Vercel Inc. | Hosting & Infrastructure | USA | SOC 2, ISO 27001 |
| Stripe Inc. | Payment Data Provider | USA | PCI DSS Level 1, SOC 2 |
| Plaid Inc. | Bank Data Aggregation | USA | SOC 2 |
| Intuit Inc. (QuickBooks) | Accounting Data Provider | USA | SOC 2, ISO 27001 |
| [Database Provider] | Database Hosting | [Region] | [Certifications] |

---

**Document Version:** 1.0  
**Last Reviewed:** October 8, 2025  
**Next Review:** January 8, 2026

---

*This DPA template complies with GDPR Article 28 requirements. For executed agreements, contact legal@finaclyai.com*

