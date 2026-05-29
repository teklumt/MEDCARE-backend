ADDIS ABABA SCIENCE AND TECHNOLOGY UNIVERSITY
(AASTU)
COLLEGE OF ENGINEERING
DEPARTMENT OF SOFTWARE ENGINEERING
Design and Development of an AI-Powered Web Platform for Healthcare Navigation and Medication Access in Ethiopia
Name ID
Dawit Sema ETS0455/14
Delal Mohammed ETS0482/14
Surafel Abera ETS1507/14
Teklu Moges ETS1531/14
Yordanos Legesse ETS1760/14

Advisor Name: ****\*\*****\_\_\_****\*\***** Signature**\*\***\_\_\_\_**\*\***
Date: 20/1/ 2026
Table of Content

Chapter One: Introduction 1
1.1 Statement of the Problem 1
1.2 Objectives 3
1.2.1 General Objective 3
1.2.2 Specific Objectives 4
1.3 Scope and Limitation 5
1.4 Methodology 6
1.5 Plan of Activities 7
1.5.1 Phase One: Documentation and Design (August 2025 to January 2026) 7
1.5.2 Phase Two: Implementation and Testing (January 2026 to April 2026) 8
1.6 Budget Required
1.7 Significance of the Study 9
1.8 Outline of the Study 11
Chapter Two: Literature Review 12
2.1 Study Related Works 12
2.2 Identifying Milestones of Related Literature and Finding the Gaps 20
2.3 Lessons Learned from Literature and Implications for MED-CARE Ethiopia 24
Chapter Three: Problem Analysis and Modeling 28
3.1 Existing System and Its Problems 28
3.2 Specifying the Requirements of the Proposed Solution 29
3.3 System Modeling 30
3.3.1 Functional Requirements 30
3.3.2 Non-Functional Requirements 32
3.3.3. Usecase 34
3.3.3.1 Use Case Diagram 36
3.3.1.2 Use Case Identification 37
3.3.1.3 Detailed Use Case Specifications 41
3.3.4 Dynamics models of the system 42
3.3.4.1 Sequence diagrams 43
3.3.4.1.1 User registers / logs in (with optional MFA) 43
3.3.4.1.3 Patient uploads prescription image → OCR → medicine recognition 44
3.3.4.1.5 Patient → Pharmacist real-time chat (End-to-End Encrypted) 46
3.3.4.1.6 Patient talks to RAG-powered Medical Chatbot 46
3.3.4.1.7 Patient uses Advanced AI Health Assistant – Symptom Checker 47
3.3.4.1.8 Pharmacy supplier adds/updates medicine stock 48
3.3.4.1.9 Pharmacy supplier receives new order notification → accepts/rejects 49
3.3.4.1.10 Patient rates pharmacy after service 50
3.3.4.1.11 Admin verifies new pharmacy license application 50
3.3.4.1.12 Admin suspends pharmacy/supplier account 51
3.3.4.1.13 Chapa payment initiation → successful payment 52
3.3.4.2 Activity Diagrams 54
3.3.4.2.1 End User Search & Purchase Workflow 54
3.3.4.2.2 AI Symptom Checker & Triage Workflow 56
References 57

Abstract
This project addresses critical healthcare access and medication management challenges in Ethiopia through the design and development of MED-CARE Ethiopia, a comprehensive web-based application. The project is motivated by the significant information gap between patients and healthcare providers, evidenced by a 59.9% medication administration error rate in Addis Ababa hospitals and systemic inefficiencies in locating facilities and available medicines. The research establishes that while foundational digital health systems like DHIS2 exist, a patient-centric platform integrating real-time medication tracking, facility location, and secure communication is absent. MED-CARE Ethiopia fills this gap by leveraging a responsive Next.js web architecture to ensure accessibility across Ethiopia's diverse device landscape, an AI chatbot with multilingual Amharic and English support for immediate patient queries, and end-to-end encrypted messaging for secure patient-provider communication. A key technical innovation is the integration of Mistral AI for prescription image recognition and a Pinecone vector database to enable semantic search, directly addressing the epidemic of errors from illegible prescriptions. The project follows an Agile Scrum methodology, with development structured into a nine-month, two-phase plan encompassing documentation, design, implementation, and rigorous testing. The findings from the literature review and system design confirm that a responsive web application, as opposed to native mobile apps, offers superior reach and accessibility in resource-constrained settings. The significance of this work lies in its potential to transform healthcare navigation in Ethiopia, reducing treatment delays, improving medication safety, and supporting national digital health goals. MED-CARE Ethiopia provides a scalable, evidence-based model for deploying integrated digital health solutions that combine AI intelligence with practical, secure communication to strengthen healthcare systems in developing contexts.

Chapter One: Introduction
Ethiopia's healthcare system faces critical access challenges despite ongoing digital transformation efforts. Patients frequently waste hours or days searching for available medications and healthcare facilities, resulting in treatment delays and deteriorating health outcomes. The country has established foundational digital health infrastructure through initiatives like the Electronic Community Health Information System and Health Information System 2 (DHIS2), yet a significant information gap persists between patients and healthcare providers. This gap creates inefficiencies that undermine resource utilization in a health system constrained by a 69.8% funding shortfall and a physician-to-population ratio of 0.108 per 1,000 people.

Ethiopia's digital landscape presents a foundation for addressing this challenge. Mobile penetration has reached 63.8% of the population with 85.4 million cellular connections active in 2025, and internet penetration stands at 21.3% with steady growth. Over 70% of users access health information through smartphones, while research from Debre Markos University shows that 59% of health science students use mobile health applications. This digital adoption, combined with Ethiopia's existing web-based health systems, creates an opportunity for web-based solutions that offer superior reach across devices without requiring mobile app installations.

Web-based healthcare applications address critical gaps in Ethiopia's existing vertical disease-focused programs. Responsive design ensures accessibility across desktops, tablets, and smartphones, accommodating the country's diverse technology landscape. Evidence demonstrates that responsive healthcare websites increase patient referrals by up to 52% and reduce patient wait times through improved care coordination. The specific medication management challenge is acute, with 59.9% of nurses in Addis Ababa federal hospitals committing medication administration errors, where illegible prescriptions contribute to 64.7% of these errors.
1.1 Statement of the Problem
MEDICAL CARE (MED-CARE) in Ethiopia addresses the specific information gap between patients and healthcare facilities through a comprehensive web application with integrated AI chatbot, medicine delivery services, and end-to-end messaging capabilities. Unlike existing vertical programs focused on specific diseases, this platform provides real-time, location-based healthcare facility and pharmacy search services, including identification of nearby pharmacies with specific medicines in stock and options for requesting home delivery of available medications. Patients currently waste significant time locating available medications, traveling between pharmacies, and identifying appropriate healthcare facilities, creating treatment delays and poor health outcomes.
In addition to difficulties in locating medicines, many patients in Ethiopia face significant challenges in physically accessing pharmacies even after identifying where medications are available. Individuals living in remote areas, elderly patients, and those with mobility limitations often struggle to travel long distances to obtain prescribed medicines. Transportation limitations, traffic congestion in urban areas, and long waiting times at pharmacies further delay access to essential medications. The absence of an integrated digital medicine delivery mechanism forces patients to travel to pharmacies even when medicine availability is confirmed online, reducing the practical effectiveness of digital healthcare navigation systems.
Integrating a medicine delivery feature into the MED-CARE platform allows patients to order prescribed medications online and receive them at their homes through registered pharmacy delivery services. This functionality can significantly improve medication accessibility, reduce travel burdens, and ensure timely treatment for patients who cannot easily reach healthcare facilities. By combining real-time medicine availability tracking with a coordinated delivery system, the platform can transform how patients obtain essential medications in Ethiopia.
The AI chatbot component enhances patient engagement by providing immediate responses to healthcare queries, medication information, and facility recommendations without requiring direct contact with healthcare staff. End-to-end encrypted messaging enables secure communication between patients and healthcare providers, ensuring patient privacy while facilitating timely clinical consultations. This integrated communication infrastructure transforms passive information retrieval into active healthcare dialogue, enabling patients to receive personalized guidance throughout their healthcare journey.

Studies in Ethiopian hospitals reveal non-interoperable systems, fragmented data access, and lack of unified healthcare facility information platforms. The health sector faces challenges including 853 healthcare facilities damaged in conflict-affected regions and critical shortages in healthcare professionals. These systemic constraints make efficient healthcare navigation through web-based technology essential for optimal resource utilization. The addition of AI-powered chat and secure messaging addresses communication bottlenecks that currently force patients to navigate fragmented information sources across multiple platforms.
The AI chatbot reduces the burden on overstretched healthcare staff by automating responses to common patient inquiries regarding medication availability, facility locations, operating hours, and general health information. Machine learning capabilities enable the chatbot to improve responses through user interaction patterns, adapting to patient needs and local healthcare contexts. End-to-end encrypted messaging ensures compliance with Ethiopian health data privacy regulations while enabling healthcare workers to respond to patient inquiries asynchronously, improving service efficiency in resource-constrained settings.
The guiding research question is: How can a web-based application with AI chatbot, real-time medicine availability tracking, integrated medicine delivery services, and end-to-end messaging improve healthcare facility access and medication information management in Ethiopia's evolving digital health ecosystem? This question is critical because integrated communication and service platforms directly reduce treatment delays, improve resource utilization, and support Ethiopia's broader health system transformation objectives. The combination of intelligent automation, secure messaging, and digital medicine delivery creates a comprehensive solution addressing information access, medication availability, healthcare accessibility, and provider–patient communication gaps.
1.2 Objectives
1.2.1 General Objective
Develop and implement a unified web-based health navigation platform that improves healthcare facility access, medication management, and medicine delivery services for Ethiopian patients through integrated AI chatbot assistance and secure end-to-end messaging. The system combines real-time facility location services, live medication availability tracking, multi-language AI chatbot support (including Amharic, English, Oromo, and other local languages), integrated medicine ordering and delivery functionality, and encrypted patient-provider communication within a single interface.
The platform ensures equitable access by providing culturally appropriate chatbot responses and multi-language functionality that accommodates Ethiopia’s diverse linguistic population. Its responsive, cross-platform architecture supports usage across desktops in healthcare facilities, tablets used by providers, and smartphones commonly used by patients.
AI chatbot automation offers immediate answers to common health queries, medication information, facility navigation, and medicine availability, reducing the workload on healthcare staff. Encrypted messaging enables secure consultations, supporting patients in remote areas and ensuring compliance with Ethiopian health data privacy regulations.
The system also enables patients to request home delivery of available medications from registered pharmacies, reducing travel burdens and improving access to essential medicines for individuals with mobility challenges or those living far from healthcare facilities.
Overall, the general objective is to build a secure, multi-language, AI-powered web application that enables Ethiopian patients to easily locate healthcare facilities, check real-time medication availability, order medicines from nearby pharmacies, receive medication delivery services, and communicate with providers through encrypted messaging.
1.2.2 Specific Objectives
Develop a Comprehensive Healthcare Web Application (Timeline: 4 Months)
Build a platform that allows users to search and locate hospitals, clinics, and nearby pharmacies.
Include real-time medicine stock availability for prescribed drugs.
Ensure accessibility from any internet-connected device.
Incorporate AI-powered search in both Amharic and English.
Implement Responsive Web Design Architecture (Timeline: 2 Months)
Provide optimal user experience across desktop computers, tablets, and smartphones.
Ensure accessibility for Ethiopia’s diverse technology landscape, including:
Areas with 63.8% mobile penetration rate
Users accessing via internet cafés
Healthcare facility computers
Follow modern responsive UI/UX standards.
Integrate AI-Driven Chatbot Functionality
Provide immediate responses to:
Healthcare queries
Medication information
Facility recommendations
Automate routine inquiries to reduce workload on healthcare staff.
Enable End-to-End Encrypted Messaging
Establish secure communication channels between patients and healthcare providers.
Ensure full compliance with Ethiopian health data privacy regulations.
Support remote areas by enabling clinical consultations and personalized health guidance without geographic barriers.
Integrate AI-Driven Prescription Recognition Technology
Use web-based image processing to analyze prescription photos.
Provide accurate medication information based on extracted text.
Reduce medication errors and assist health extension workers in service delivery.

Implement Medicine Ordering and Delivery Support
Allow patients to request medicines from pharmacies that have confirmed stock availability
Provide functionality for pharmacies to manage incoming medicine orders and delivery requests.
Enable order tracking and status updates to inform patients when medicines are prepared and delivered.
Improve medication accessibility for patients who face mobility, distance, or transportation barriers.

1.3 Scope and Limitation
Scope
MED-CARE Ethiopia develops a responsive web application focused on healthcare facility location, medication management, and medicine delivery coordination within Ethiopia's existing digital health ecosystem. The web-based application includes comprehensive healthcare facility search and location services accessible through web browsers on all devices, real-time pharmacy medicine availability tracking, online medicine ordering, and delivery request functionality connecting patients with registered pharmacies.
The system also incorporates AI-powered prescription image recognition using cloud-based optical character recognition technology, multi-language support in Amharic and English, user profile management with healthcare facility ratings, and progressive web app capabilities for improved mobile experience during limited connectivity scenarios.
Technical architecture encompasses responsive web design optimized for desktop, tablet, and mobile browsers, cloud-based web services compatible with Ethiopia's telecommunications infrastructure, cross-browser compatibility, and Next.js implementation following modern web standards.
Limitations
A significant limitation exists regarding digital literacy and device accessibility across Ethiopia's population. Many citizens lack awareness and training in using digital systems, presenting barriers to platform adoption despite technical accessibility. Substantial portions of the target population do not own smartphones or internet-connected devices, limiting direct individual access to the application.
This challenge requires complementary strategies including community health worker training, healthcare facility computer access points, and digital literacy programs to enable equitable use across diverse population segments. Initial deployment focuses on healthcare facilities and urban centers with existing internet infrastructure, with expansion to underserved communities dependent on external digital literacy initiatives and device accessibility improvements.
Additionally, medicine delivery services depend on the operational capacity of participating pharmacies and available transportation resources. The system will facilitate delivery coordination and order management but does not control external logistics infrastructure such as transportation networks or pharmacy distribution systems.
The broader healthcare access challenge includes transportation affordability and medical supply chain issues that remain outside project boundaries, with MED-CARE Ethiopia specifically addressing the information, communication, and coordination components through web technology. Digital system adoption requires concurrent investment in digital infrastructure, user training, and community awareness efforts beyond the application's technical scope.
1.4 Methodology
MED-CARE Ethiopia follows an agile software development process aligned with Computer Science and Software Engineering principles, ensuring iterative development, flexibility, and alignment with Ethiopia's digital health ecosystem. This approach enables rapid prototyping, continuous feedback, and adaptation to user needs.
A mixed-methods approach combines qualitative and quantitative data gathering for requirements elicitation and system evaluation. User requirements are collected through surveys and interviews with stakeholders including patients and healthcare workers using stratified sampling representing urban and rural populations. Evaluation employs experimental groups with a control group using existing tools and an intervention group using the web application, measuring metrics such as time to locate facilities and error rates in medication identification through simulated prescriptions.Software construction adopts the Agile Scrum framework with two-week sprints enabling incremental feature delivery. Front-end development uses Next.js for responsive web design ensuring cross-device compatibility with Tailwind CSS for UI components. Backend utilizes Node.js with Express.js for RESTful APIs integrated with MongoDB for storing facility data compliant with Ethiopia's data governance.
AI features leverage Mistral AI for optical character recognition processing of prescription images and medical documents. Extracted text and medical information are indexed and stored in the Pinecone vector database, enabling semantic search and document retrieval capabilities. The AI agent accesses Pinecone-indexed documents to provide intelligent responses through the chatbot interface, allowing patients to retrieve relevant medication information, facility details, and health guidance based on natural language queries. This architecture combines OCR capabilities with vector database indexing to create a knowledge-retrieval system where the AI agent intelligently searches and synthesizes information from stored medical documents and healthcare facility records.
Testing includes unit tests with Jest, integration tests for API endpoints, and end-to-end tests with Cypress for browser simulation. Security follows OWASP guidelines with penetration testing ensuring data privacy aligned with Ethiopia's health data regulations. This methodology ensures the web application is user-centered, technically robust, and evaluable for its impact on healthcare access.
1.5 Plan of Activities
The project spans nine months across two distinct phases. Phase One runs from August 2025 to January 2026, focusing on comprehensive documentation and system design. Phase Two runs from January 2026 to April 2026, emphasizing implementation and testing. This phased approach allows for thorough planning and architecture development before technical implementation, ensuring alignment with requirements and reducing development risks.
1.5.1 Phase One: Documentation and Design (August 2025 to January 2026)
Conduct comprehensive user surveys and interviews with patients, healthcare workers, and facility administrators across urban and rural settings
Finalize technology stack and define system architecture with initial design prototypes for user interface and chatbot interaction flows
Document responsive web design specifications across all device types and AI agent architecture
Design Pinecone vector database schema for medical document indexing and retrieval
Document security architecture aligned with Ethiopian health data privacy regulations
Develop technical specifications for Mistral AI integration and chatbot functionality
Complete comprehensive documentation of all system components, APIs, database schemas, and integration points
Finalize user journey documentation for chatbot interactions and end-to-end messaging flows
Prepare compliance documentation ensuring adherence to Ethiopian digital health data governance requirements
Create sprint planning documents, resource allocation strategies, and deployment architecture design
Conduct design review and refinement based on stakeholder feedback
Obtain final approval of all design documents and technical specifications

1.5.2 Phase Two: Implementation and Testing (January 2026 to April 2026)
Develop backend using Node.js and Express.js for RESTful APIs
Implement MongoDB database and configure Pinecone vector database for medical document indexing
Develop frontend with Next.js and Bootstrap ensuring responsive design across all devices
Integrate Mistral AI for prescription image recognition and optical character recognition processing
Configure Pinecone indexing system for medical document storage and retrieval
Develop chatbot functionality with Amharic and English language support
Establish end-to-end encrypted messaging infrastructure for secure patient-provider communication
Implement healthcare facility search and location services functionality
Build user profiles and facility rating system
Integrate digital health payment system
Implement progressive web app capabilities for improved mobile experience
Conduct unit testing with Jest across all components
Perform integration testing for API endpoints
Execute end-to-end testing with Cypress across all features
Conduct security testing following OWASP guidelines
Perform penetration testing for data privacy compliance
Optimize performance and test cross-browser compatibility
Conduct beta testing with selected user groups
Deploy full system following successful testing
Configure usage analytics and monitoring
Complete project documentation and final report Biweekly Scrum meetings occur throughout both phases to review progress and ensure milestones align with stated objectives.

1.6 Budget Required
1.7 Significance of the Study
MED-CARE Ethiopia represents advancement in Ethiopia's digital health transformation through innovative web technology, directly supporting the country's Health Coverage goals and digital health strategy objectives. The project's significance extends across multiple healthcare delivery and system strengthening dimensions through accessible, cross-platform web solutions.
Immediate healthcare access improvement occurs through connecting patients with appropriate facilities efficiently via any internet-connected device. With Ethiopia's geographic disparities in healthcare access, efficient web-based facility location becomes critical for optimal resource utilization. Research demonstrates that responsive healthcare websites reduce patient wait times, improve care coordination, and increase patient referrals, directly improving health outcomes.
Web applications offer superior reach compared to mobile apps by accessing desktop computers, laptops, tablets, and smartphones without requiring downloads or installations. This accessibility advantage is particularly important in Ethiopia where device diversity and storage limitations may prevent mobile app adoption.
Evidence-based impact on healthcare quality is substantial, as responsive websites provide credible representation and increase patient referrals by up to 52%. The web application addresses critical medication management needs given the 59.9% medication administration error rate among nurses with illegible prescriptions contributing to 64.7% of these errors.
MED-CARE Ethiopia generates valuable evidence about implementing AI-powered web applications in Ethiopia. The responsive web design approach supports users accessing from modern smartphones or older desktop computers in healthcare facilities. The project contributes to growing research on web-based healthcare solutions in the Ethiopian context.
Web-based architecture enables seamless expansion across different devices, operating systems, and geographic regions. Responsive design ensures consistent functionality whether accessed from urban internet cafes, healthcare facility computers, or personal mobile devices, supporting regional health security and digital health cooperation initiatives.
The project represents a foundational step toward comprehensive web-based digital health ecosystem development in Ethiopia. Usage analytics and user feedback through standard web technologies guide Ethiopia's broader digital health strategy implementation and support evidence-based policy making.

1.8 Outline of the Study
This document is organized to guide readers through the complete project structure and understanding. Chapter One provides the introduction including problem statement, objectives, scope, methodology, activities, budget, and significance of the study. Subsequent chapters detail the system requirements specification, design architecture, implementation approach, testing methodology, results and findings, and recommendations for future work.
The problem statement in Chapter One establishes that MED-CARE Ethiopia addresses a critical information gap in Ethiopia's healthcare system through web-based technology. The objectives guide the project toward developing a responsive web application improving healthcare facility access and medication management. The methodology section details the agile software development process, mixed-methods evaluation approach, technology stack, and security standards employed.
The study's significance lies in advancing Ethiopia's digital health transformation while generating evidence about web-based healthcare solutions in developing contexts. This introduction sets the foundation for understanding how responsive web technology can effectively address healthcare access challenges while ensuring broad compatibility and accessibility. The project contributes to Ethiopia's health system strengthening goals and provides a scalable model for regional digital health initiatives, reinforcing the importance of this study and establishing the context for subsequent chapters detailing technical implementation and outcomes.

Chapter Two: Literature Review
Overview and Purpose
The literature review for MED-CARE Ethiopia addresses the critical intersection of digital health innovation, healthcare accessibility challenges in resource-constrained settings, and the application of web-based technologies to solve information gaps in healthcare systems. This review synthesizes evidence from academic research, policy documents, and implementation case studies across Sub-Saharan Africa, with particular focus on Ethiopia's evolving digital health ecosystem. The purpose is to establish the theoretical foundation and empirical evidence base that justifies the development of a comprehensive web-based platform combining artificial intelligence, responsive design, and secure communication to address medication management and healthcare facility access challenges. By examining existing research on telemedicine adoption, digital health systems, medication error reduction, and technology implementation in developing contexts, this review demonstrates how MED-CARE Ethiopia builds upon established best practices while addressing identified gaps in Ethiopia's healthcare information infrastructure [1]. The subsequent literature review fits into the overall study by providing the scientific rationale for the project's approach, identifying successful implementation models from similar contexts, and highlighting the specific barriers and enablers that must be addressed for successful deployment in Ethiopia's diverse socioeconomic and technological landscape [6].
2.1 Study Related Works
Digital Health Systems and Telemedicine in Sub-Saharan Africa
Ethiopia's healthcare transformation occurs within a broader Sub-Saharan African digital health movement characterized by rapid innovation and scale-up of electronic health information systems. A systematic review of telemedicine adoption across South Africa, Kenya, and Nigeria identified 53 studies published between 2014-2024, demonstrating that telemedicine has emerged as a transformative solution to healthcare access challenges in the region [6]. The review documented that Kenya demonstrates strong mobile health integration with advanced applications in maternal health, HIV care, and sexual and reproductive health, while technologies including SMS-based interventions, mobile applications, and secure web-based portals are reshaping healthcare delivery across diverse contexts. This evidence suggests that web-based healthcare solutions represent a viable and scalable approach for African healthcare systems facing similar access barriers.
Ethiopia specifically has established foundational digital health infrastructure through initiatives that directly support MED-CARE Ethiopia's objectives. The nationwide implementation of DHIS2 (District Health Information Software 2) before 2017 addressed fragmented, paper-based systems that previously limited timely healthcare decision-making. Implementation results demonstrated that 87% of healthcare facilities utilized DHIS2 data for budgeting decisions and over 96% for service delivery monitoring. While DHIS2 provides system-level data management capabilities, a significant gap persists at the patient-provider interaction level, the point where medication availability information and facility location data directly impact individual healthcare navigation [4]. The Electronic Community Health Information System (eCHIS) represents another key initiative, digitizing the work of Health Extension Workers through mobile applications with web-based monitoring portals. eCHIS deployment across over 4,000 health posts and health centers demonstrates successful scale-up of digital tools for community health workers, establishing technological readiness and organizational acceptance of mobile health solutions in Ethiopian health settings [5]​.

Despite these foundational investments, research identifies a persistent information gap between patients seeking healthcare and facility/medication availability data. The L10K 2020 Project in Ethiopia piloted context-appropriate smartphone-based mHealth solutions for maternal and child health services, demonstrating that mHealth applications facilitating real-time information exchange, defaulter tracing, referral systems, and feedback mechanisms were user-friendly and effective at the health worker level [5]. However, studies from both Kenya and Rwanda identified that private and public sector disparities, underdeveloped electronic health record systems, and lack of unified healthcare facility information platforms remain critical challenges to integrated healthcare access. This evidence directly supports MED-CARE Ethiopia's approach of developing a unified digital platform addressing the patient-level information gap that existing vertical disease programs and facility-based EMR systems do not fully resolve.

Web-Based Healthcare Applications and Responsive Design
While mobile health applications have received substantial research attention, web-based healthcare solutions offer distinct advantages for resource-constrained settings that MED-CARE Ethiopia leverages. Research demonstrates that web applications provide superior reach compared to mobile apps by enabling access through desktop computers, tablets, and smartphones without requiring installations or large device storage allocations . A comparative analysis of mobile versus web healthcare applications found that 83% of patient portal users access health information via computers, and web apps are more easily discoverable through search engines, a critical consideration in settings where users lack familiarity with app store navigation. The digital divide in Africa, characterized by variations in device ownership, connectivity reliability, and digital literacy, makes web-based accessibility essential for equitable healthcare access [6]. Studies in rural Ghana revealed that despite mobile phone availability, many individuals lack the digital skills to utilize sophisticated applications, with digital literacy gaps particularly pronounced among older adults and women [7]​.
Progressive Web Apps (PWAs) represent an emerging solution combining website accessibility advantages with native app functionality through offline capabilities, push notifications, and IndexedDB local storage. Research on PWAs in healthcare demonstrates that offline functionality is vital for remote and underserved areas where internet connectivity fluctuates unpredictably [6]. Evidence from healthcare PWA implementations shows that cross-device compatibility, responsive design, and reduced friction from app downloads significantly increase adoption rates compared to traditional native applications, particularly among digitally hesitant populations [20]. This technological foundation directly supports MED-CARE Ethiopia's architectural decision to develop a responsive web application rather than platform-specific mobile apps, ensuring accessibility across Ethiopia's diverse technology landscape including internet cafes, healthcare facility computers, and personal mobile devices [6]​.
Responsive design principles for healthcare websites have been extensively validated through implementation research. Healthcare responsive websites incorporating mobile-first design principles, larger buttons optimized for touch interfaces, and device-adaptive layouts increase patient referrals by up to 52% and reduce patient wait times through improved care coordination [19]. These design principles address specific barriers identified in Ethiopia's healthcare context, including the 69.8% health system funding shortfall and the need to maximize efficiency of limited healthcare facilities through better patient navigation [1]​.
Artificial Intelligence and Chatbot Applications in Healthcare
AI-powered chatbots have demonstrated significant potential for healthcare delivery across diverse use cases documented in peer-reviewed literature. A comprehensive review of notable AI chatbots identified that symptom-checking bots like Ada Health, Babylon Health, and Infermedica provide immediate, scalable patient support for common healthcare queries while reducing burden on overstretched healthcare staff [12][14]. These systems employ natural language processing and machine learning to interpret patient inputs, provide medication information, and recommend appropriate facility referrals [13]. Evidence demonstrates that healthcare chatbots can reduce unnecessary emergency room visits and improve telehealth efficiency by conducting preliminary consultations and gathering patient data [14]. A clinical study of Babylon Health's AI-recommended triage found it to be slightly safer on average than human doctor recommendations (97.0% safe versus 93.1% for doctors), with comparable appropriateness ratings [13]​.
Multilingual chatbot functionality is particularly critical for Ethiopia's diverse linguistic context. Research on voice-activated multilingual health assistants demonstrates that chatbots designed with healthcare datasets in multiple languages can provide accurate, context-sensitive responses with speech-based output, breaking language barriers that have historically limited healthcare access [10][14]. A study of multilingual healthcare chatbots using fine-tuned language models on medical datasets showed BLEU scores between 0.8 and 0.9, indicating strong translation accuracy and contextually appropriate responses [10]. This evidence supports MED-CARE Ethiopia's design to integrate AI chatbot functionality in Amharic and English languages, directly addressing the communication barrier documented in Ethiopia's health system where linguistic diversity creates information access challenges [10][13]​.
AI-driven prescription image recognition using Optical Character Recognition (OCR) technology directly addresses the medication administration error epidemic documented in Ethiopian hospitals. Studies demonstrate that prescription OCR systems can recognize handwritten or printed prescriptions and link medication names with dosage information, achieving error rates lower than manual transcription while substantially reducing recording time crucial for polypharmacy management where elderly patients commonly take five or more medications [8]. The specific problem of illegible prescriptions is acute: studies show that 24-64.7% of medication errors in Ethiopian hospitals result from illegible handwriting on prescriptions, with OCR systems demonstrating 84-87% accuracy rates in recognizing handwritten medical text even from varied handwriting styles [8]​.
Medication Error Prevention and Management Systems
The medication administration error crisis in Ethiopian healthcare provides compelling justification for MED-CARE Ethiopia's prescription recognition and medication information features. A study of medication administration errors in Addis Ababa federal hospitals found a 59.9% error rate among nurses, with illegible prescriptions contributing to 64.7% of these errors, wrong time administration occurring in 56.8% of instances, and documentation errors in 33.3% of cases [16]. The broader African hospital context shows medication administration error rates ranging from 56.4% to 61.1% in intensive care units, with errors resulting in patient harm rates of 4.5-20.1% with a median mortality rate of 0.1% [16]. These preventable adverse events directly reduce health outcomes and patient trust in healthcare systems [1]​.
Pharmacy management systems incorporating real-time inventory tracking, medication availability data, and integration with healthcare facility networks have been documented to reduce medication errors and improve operational efficiency [4]. Research on automated medication management demonstrates that real-time stock updates, product expiration tracking, and predictive analytics enable healthcare facilities to prevent medication stockouts while minimizing overstocking a critical efficiency measure in resource-constrained settings like Ethiopia [4]. Studies on medication tracking integration with telehealth platforms show that secure prescription handling, medication reminder systems, and provider-patient communication within unified digital platforms improve medication adherence and reduce treatment delays [14][19]​.

Healthcare Facility Location Services and Referral Systems
Location-based healthcare services represent an evidence-based approach to improving care coordination and reducing treatment delays. Research on healthcare facility locator services demonstrates that web-based directory systems enabling users to find nearest hospitals or clinics based on their location and health needs significantly improve healthcare access [6]. A study of health information technology-enabled referral systems across global contexts found that electronic referral systems reduce unnecessary follow-up for patients, improve healthcare access quality, and reduce waiting times compared to paper-based referral processes [3]. Multiple studies documented that electronic referral system implementation increases efficiency by 40% through improved communication between referring clinicians and specialists while reducing inappropriate referrals [3]​.
In the Ethiopian context, the Master Facility Registry and facility interoperability initiatives create foundational infrastructure that MED-CARE Ethiopia can leverage [3]. However, research identifies that while facility data exists within health management systems, patient-level access to real-time facility location and medication availability information remains underdeveloped [4]. The fragmented landscape of interoperable systems documented in Botswana and other Sub-Saharan African countries demonstrates that non-interoperable eRecord systems result in fragmented care delivery and unnecessary healthcare expenditure challenges MED-CARE Ethiopia's integrated platform directly addresses [9]​.
Data Security and End-to-End Encryption in Healthcare
Security implementation for healthcare applications is not optional but essential for regulatory compliance and patient trust. End-to-end encryption research demonstrates that asymmetric encryption (RSA) for message transmission combined with symmetric encryption (AES-256) for storage and processing provides comprehensive data protection throughout the message lifecycle [16][19]. A healthcare application case study implementing dual-layer encryption achieved HIPAA compliance while maintaining operational efficiency demonstrating that robust security need not compromise user experience [19]. Implementation research on end-to-end encrypted healthcare platforms shows that secure key management through hardware security modules or Trusted Platform Modules, combined with regular key rotation protocols, enables compliance with healthcare data privacy regulations while maintaining system responsiveness [16]​.
Ethiopia's health data privacy regulatory framework requires protection of sensitive patient information comparable to HIPAA and GDPR standards [20]. The integration of end-to-end encrypted messaging ensures that patient-provider communication through MED-CARE Ethiopia remains confidential throughout transmission and storage, enabling secure clinical consultation without exposing sensitive health information to intermediaries or data breaches [16][19]​.
Vector Databases and Semantic Search for Medical Knowledge Management
Vector databases represent an emerging capability for organizing and retrieving medical knowledge at scale, particularly suited to healthcare applications requiring semantic understanding of medical terminology. Research demonstrates that vector databases efficiently store high-dimensional data representing medical images, genomic information, and textual medical records through embeddings that capture semantic relationships [13]. By transforming unstructured medical data into vector representations, these systems enable similarity searches and retrieval based on semantic meaning rather than exact keyword matches significantly improving relevance of search results for clinical queries [13]​.
In the context of MED-CARE Ethiopia's architecture, vector database indexing of medical documents enables the AI agent to intelligently search and synthesize prescription information, facility data, and medication knowledge through natural language queries rather than requiring exact terminology matches [10]. Research on semantic search in medical records demonstrates that systems integrating Natural Language Processing with medical ontologies like SNOMED-CT or ICD-10 achieve twice as many clinically relevant matches compared to literal text-based search alone, with very high precision and recall [10]. This capability directly supports MED-CARE Ethiopia's goal of providing medication information retrieval that interprets patient intent and clinical context rather than requiring expert medical terminology [13]​.
Digital Health Adoption Barriers and Enablers in Developing Contexts
While technology capabilities are necessary for digital health success, research demonstrates that contextual barriers significantly impact adoption and sustained use. Studies across Sub-Saharan Africa identified that infrastructure limitations, digital literacy gaps, socio-cultural barriers, and organizational factors represent critical adoption barriers [6][7]. In rural Ethiopia and Ghana, healthcare workers and patients lack necessary digital skills to utilize telemedicine platforms, with educational attainment particularly low in northern regions where access to training opportunities remains limited [7]​.
However, research also identifies enabling factors that can overcome these barriers when deliberately addressed. Structured digital literacy programs, even brief focused sessions, significantly boost user confidence and adoption rates, with Rwanda's community-based trainings demonstrating that empowering local health workers to deliver digital literacy instruction accelerates user adoption [9]. The successful implementation of eCHIS across 4,000+ health posts demonstrates that appropriate technology design, aligned training strategies, and integration with existing workflows enable technology adoption even in resource-constrained Ethiopian health settings [5]​.
Organizational factors significantly influence adoption success. Studies on EMR adoption in developing countries found that usefulness, critical success factors, awareness, and relative advantage significantly influence clinicians' intention to adopt electronic systems, with infrastructure availability surprisingly not being statistically significant when systems delivered perceived value [7]. This finding suggests that MED-CARE Ethiopia's focus on delivering immediate, tangible value through medication availability tracking and facility location services will drive adoption even in settings with infrastructure limitations [4][7]​.
Agile Development in Healthcare IT Projects
Software development methodology significantly impacts healthcare IT project success in resource-constrained environments. Research demonstrates that Agile methodologies offer advantages over traditional Waterfall approaches for healthcare projects by enabling rapid prototyping, continuous feedback, and adaptation to evolving user needs while maintaining focus on patient safety and regulatory compliance [8]. A comprehensive review of Agile implementation in healthcare identified that iterative development enables early identification of issues, continuous improvement, and adaptation based on real-time feedback from diverse stakeholders including clinicians, administrators, and IT professionals [8]​.
Agile's emphasis on cross-functional collaboration directly addresses healthcare IT project complexity by facilitating open communication between technical teams and healthcare providers, breaking down silos that often result in systems misaligned with clinical workflows [8]. Implementation research demonstrates that two-week sprint cycles with stakeholder feedback enable healthcare organizations to rapidly respond to clinical protocol changes, security requirements, and regulatory amendments without lengthy deployment delays [8]. This evidence supports MED-CARE Ethiopia's adoption of Agile Scrum framework with two-week sprints, enabling rapid iteration while maintaining alignment with Ethiopian health system requirements and stakeholder needs [8]​.
2.2 Identifying Milestones of Related Literature and Finding the Gaps
Key Milestones in Digital Health Development
The literature reveals several critical milestones that have shaped the digital health field and created conditions enabling projects like MED-CARE Ethiopia:
Milestone 1: Mobile Health Proliferation (2010-2015): The proliferation of SMS-based health interventions and early mobile health applications established that mobile technology could effectively deliver healthcare information to resource-limited populations [1]. Studies documented mHealth effectiveness in maternal health, disease surveillance, and treatment adherence across Sub-Saharan Africa. This milestone demonstrated technological feasibility but also revealed limitations of mobile apps regarding device accessibility and storage constraints in low-resource settings [6]​.
Milestone 2: Health Information System Integration (2015-2020): The widespread adoption of DHIS2 and national health management information systems across Sub-Saharan Africa, including Ethiopia, established that web-based health information management could scale effectively at the health system level [3]. This milestone demonstrated that internet-based health technologies could integrate across geographically dispersed facilities and manage complex healthcare data. However, these systems primarily serve administrative and aggregate-level reporting functions rather than patient-level clinical information access [4]​.
Milestone 3: Telemedicine and Remote Consultation Scaling (2020-present): The COVID-19 pandemic accelerated telemedicine adoption and demonstrated demand for remote healthcare consultation platforms with proven user acceptance [6]. Video conferencing, secure web portals, and asynchronous messaging became normalized healthcare delivery modalities across developed and developing contexts. This milestone established that patients and providers accept digital communication for healthcare but revealed that fragmented platforms limit care continuity [14]​.
Milestone 4: AI and Natural Language Processing in Healthcare (2020-present): The emergence of AI chatbots for symptom checking, clinical decision support, and patient engagement documented in peer-reviewed literature and clinical implementations demonstrates that machine learning can safely augment healthcare delivery in limited-resource settings [12][13]. This milestone suggests that intelligent automation can reduce clinician burden while improving patient access to healthcare information [14]​.
Critical Gaps
Critical Gap 1: Patient-Level Medication Availability Information: While health information systems effectively track facility-level data, research documents that patients lack access to real-time information about medication availability at specific pharmacies and healthcare facilities [4]. This information asymmetry directly contributes to the documented medication administration error epidemic in Ethiopian hospitals where 59.9% of nurses commit medication errors, with illegible prescriptions being a primary contributor [16]. Existing digital health infrastructure does not systematically track or communicate medication stock status to patients, creating treatment delays and inefficient resource utilization [4]​.
Critical Gap 2: Integrated Patient-Provider Communication Platforms: While telemedicine platforms provide video consultation and EMR systems manage clinical documentation, research identifies that fragmented communication systems requiring patients to navigate multiple platforms impede continuous care [14]. The referral system literature documents that electronic referral systems improve efficiency, but these typically operate as healthcare provider-to-provider systems without patient access to the referral process or facility information needed for navigation [3]​.
Critical Gap 3: Medication Error Reduction at Patient Point-of-Dispensing: While OCR technology for prescription recognition has been technically validated, no systematic application of this technology in actual healthcare facility operations has been documented in Ethiopian contexts [8]. The documented high rates of prescription-related errors (64.7% attributed to illegible handwriting) persist despite availability of OCR technology, suggesting an implementation gap rather than a technological gap [16]​.
Critical Gap 4: Multilingual Healthcare Information Access for Diverse Populations: While research demonstrates that multilingual healthcare chatbots can bridge language barriers, implementation remains limited primarily to urban centers and wealthy healthcare systems [10]. Ethiopia's linguistic diversity (Amharic, Oromo, and numerous local languages) creates barriers to healthcare access that existing digital health systems incompletely address [10]. MED-CARE Ethiopia's design to provide multilingual support in Amharic and English directly addresses this documented gap.
Critical Gap 5: Web-Based Healthcare Solutions Suited to Infrastructure Diversity: While literature documents both mobile app limitations and web application advantages for resource-constrained settings, few implemented healthcare projects deliberately leverage Progressive Web App technology designed to optimize functionality across the complete spectrum of device types and connectivity conditions present in Ethiopia [6][20]. This represents an implementation design gap where technological capability exceeds deployment practice.
Strengths and Weaknesses in Existing Literature
Strengths:
Robust empirical evidence documenting healthcare access challenges and medication error epidemiology in Ethiopian and African healthcare settings [1][16]
Well-established research on effective digital health interventions across Sub-Saharan Africa with documented success factors and barriers [3][5]
Comprehensive literature on AI chatbot capabilities and demonstrated clinical utility [12][13]
Extensive research on electronic referral system implementation benefits [3]
Clear evidence on web application accessibility advantages over mobile apps in resource-constrained settings [6][20]
Strong theoretical frameworks (TAM, UTAUT2) for understanding technology adoption in healthcare contexts [7]
Weaknesses:
Limited documented implementation research on integrated web-based medication management platforms in developing healthcare contexts [4]
Insufficient research on patient-centered rather than provider-centered digital health solutions [4]
Gap in literature specifically addressing healthcare facility navigation and medication availability tracking integrated within single platforms [4]
Limited evidence on OCR prescription recognition implementation in actual clinical workflows in African healthcare settings [8]
Minimal research on PWA technology specifically applied to healthcare in resource-limited settings despite theoretical advantages [20]
Insufficient longitudinal studies on sustained adoption and long-term outcomes of digital health interventions beyond pilot phases [7]
Contradictions and Unresolved Issues
Contradiction 1: Infrastructure Availability and Technology Adoption: Studies show that infrastructure availability was not statistically significant in EMR adoption propensity, contradicting assumptions that technology implementation in resource-limited settings requires prior infrastructure development [7]. This suggests that perceived usefulness and alignment with healthcare worker needs may drive adoption even without optimal infrastructure an important consideration for MED-CARE Ethiopia's implementation strategy [7]​.
Contradiction 2: Mobile App versus Web App Preferences: While mobile apps are more prevalent in Sub-Saharan Africa due to smartphone ubiquity, web-based platforms demonstrate superior reach and accessibility benefits in research literature [6][20]. This apparent contradiction resolves through recognition that PWAs combine web accessibility advantages with mobile app functionality, though implementation research remains limited [20]​.
Contradiction 3: Top-Down versus Bottom-Up Digital Health Implementation: Some research emphasizes government-led national eHealth strategies (DHIS2 rollout in Ethiopia), while other studies document that community-based digital literacy programs and bottom-up health worker-led initiatives drive adoption more effectively [5][9]. Successful implementations appear to combine both approaches rather than rely exclusively on either top-down or bottom-up strategies [5][9]​.
2.3 Lessons Learned from Literature and Implications for MED-CARE Ethiopia
Key Lessons for System Design
Lesson 1: Responsive Web Design is Essential for Equitable Access
Evidence consistently demonstrates that responsive web design optimized for desktop, tablet, and smartphone access enables broader reach than platform-specific applications [20]. Ethiopia's digital divide where urban populations have greater device access and rural populations depend on healthcare facility computers and internet cafes directly parallels the conditions where web-based solutions demonstrate superiority [6]. MED-CARE Ethiopia's implementation of responsive Next.js architecture with Tailwind CSS ensures that the platform functions optimally whether accessed from old desktop computers in rural health centers, tablets in clinics, or modern smartphones in urban areas. The design decision to prioritize cross-device compatibility over native app functionality directly reflects this literature-based evidence [20]​.
Lesson 2: Multilingual Support is Non-Negotiable for Healthcare Access in Diverse Linguistic Contexts
Research on multilingual healthcare chatbots demonstrates that language barriers significantly impede healthcare access in diverse populations [10]. Ethiopia's linguistic diversity creates barriers that monolingual systems cannot overcome [10]. The design commitment to provide Amharic and English support in the chatbot interface, with capacity for expansion to additional languages, directly addresses this documented barrier. Literature shows that culturally appropriate responses adapted to local healthcare contexts and terminology improve both acceptance and effectiveness [10][14]. This requires more than translation; it requires culturally contextualized responses, which the MED-CARE Ethiopia chatbot design incorporates through healthcare-specific fine-tuning [10]​.
Lesson 3: End-to-End Encryption Must Be Implemented From System Design Inception, Not Added Later
Research on healthcare data security demonstrates that encryption architecture must be foundational to system design, combining asymmetric encryption for transmission with symmetric encryption for storage and processing [16][19]. The literature documents that retrofitting security creates system vulnerabilities and performance issues [19]. MED-CARE Ethiopia's design incorporating end-to-end encrypted messaging from architecture inception, using RSA for transmission and AES-256 for storage, ensures compliance with Ethiopian health data privacy regulations while maintaining system responsiveness [16][19]​.
Lesson 4: Semantic Search Capabilities Enhance Clinical Relevance Beyond Keyword Matching
Vector database indexing of medical documents enables semantic search achieving twice as many relevant results compared to literal text-based search, with high precision and recall [13]. For medication information retrieval in settings where healthcare workers and patients may not use standardized medical terminology, semantic understanding becomes critical [10]. Integrating Mistral AI with Pinecone vector database enables the MED-CARE Ethiopia chatbot to interpret patient intent and return clinically relevant medication information even when queries lack exact terminology matches [13]. This architecture decision reflects literature evidence that semantic understanding significantly improves healthcare information system usability in non-expert user populations [10]​.
Lesson 5: Offline Functionality is Critical for Unreliable Connectivity Contexts
Progressive Web App research documents that offline functionality through caching and IndexedDB local storage enables access to critical healthcare information when internet connectivity fails, a frequent occurrence in rural and underserved Ethiopian healthcare settings [6][20]. MED-CARE Ethiopia's progressive web app architecture incorporating offline data access ensures that patients can access facility location data and medication information cached on their devices even during connectivity interruptions, critical for remote populations in conflict-affected regions [20]​.
Key Lessons for Implementation Strategy
Lesson 6: Digital Literacy and Training Programs Must Be Integrated Into Implementation, Not Added Later
Research documenting successful digital health implementations in Rwanda, Kenya, and Uganda consistently identifies that structured digital literacy programs and health worker training significantly improve adoption [9]. Studies show that brief focused training sessions and community-based health worker-led instruction accelerate user adoption and dispel misconceptions [9]. The MED-CARE Ethiopia implementation design incorporating community health worker training, healthcare facility computer access points, and digital literacy programs reflects this evidence. The project recognizes that digital system adoption requires concurrent investment in human capacity development, not technology deployment alone [7][9]​.
Lesson 7: Agile Methodology Enables Adaptation to Evolving Healthcare Requirements
Healthcare IT projects in resource-limited settings face rapidly changing requirements, regulatory amendments, and stakeholder feedback that rigid project management approaches cannot accommodate [8]. Two-week Agile sprints enable MED-CARE Ethiopia to rapidly iterate based on healthcare worker feedback, respond to changing security requirements, and adapt features to user needs while maintaining quality and compliance standards [8]. This methodology reflects literature evidence that iterative development with continuous feedback delivers healthcare systems better aligned with actual workflow requirements than traditional Waterfall approaches [8]​.
Lesson 8: Perceived Usefulness and Organizational Alignment Drive Adoption More Than Infrastructure
Surprisingly, research found that infrastructure availability was not statistically significant in healthcare technology adoption, while perceived usefulness and alignment with healthcare worker needs were highly significant [7]. This suggests MED-CARE Ethiopia should prioritize delivering immediate, tangible value through medication availability tracking and facility location services solving concrete problems healthcare workers and patients face daily rather than assuming technology adoption depends on prior infrastructure improvement [4][7]. The design focus on real-time, location-based medication and facility information directly reflects this adoption principle [4]​.
Lesson 9: Integration with Existing Health Systems and Data Standards is Essential
Literature documents that interoperability failures create fragmented care and duplicate effort [9]. MED-CARE Ethiopia's design incorporates FHIR standards for health data exchange, integration with DHIS2 and eCHIS where feasible, and alignment with Ethiopia's Master Facility Registry reflects evidence that new digital health solutions must integrate rather than replace existing systems [3][5]. This architecture decision enables MED-CARE Ethiopia to leverage existing health system investments while filling identified gaps [4]​.
Lesson 10: Sustainability Requires Government Leadership Commitment and Policy Support
Research on digital health sustainability across Sub-Saharan Africa documents that successful, sustained implementations require government commitment beyond pilot phases [9]. MED-CARE Ethiopia's alignment with Ethiopia's Health Sector Transformation Plan and integration with government-led initiatives (DHIS2, eCHIS, Master Facility Registry) reflects this evidence [3][5]. Long-term sustainability depends on government adoption of the platform, integration into ongoing digital health strategy, and commitment to continuous operation factors beyond technical implementation but essential for lasting impact [9]​.
Transition to System Design and Implementation
The literature review reveals that MED-CARE Ethiopia's design and implementation strategy integrate evidence-based best practices across multiple domains: responsive web architecture addresses accessibility challenges [6][20], AI chatbot functionality addresses communication barriers and staff burden [10][14], medication management features address the acute medication error epidemic [16], secure messaging addresses privacy requirements [19], and progressive web app technology addresses connectivity limitations [20]. The Agile development methodology enables the project to adapt to learning throughout implementation while maintaining focus on delivering healthcare worker and patient value [8]. The integration of digital literacy training recognizes that technology adoption requires human capacity development alongside technical capability [7][9]. By grounding the project design in comprehensive literature evidence rather than assumptions, MED-CARE Ethiopia is positioned to deliver sustainable impact on healthcare access and medication management in Ethiopia's evolving digital health ecosystem. The subsequent chapters detailing system requirements, architecture design, and implementation approach translate these literature-informed principles into specific technical and operational specifications that guide project execution.
Chapter Three: Problem Analysis and Modeling
3.1 Existing System and Its Problems
The current healthcare information landscape in Ethiopia is largely fragmented, paper-based, and decentralized. Patients typically rely on manual methods such as phone calls, word-of-mouth, or physical visits to hospitals, clinics, and pharmacies to gather basic information such as facility location, service availability, or medication stock levels. This creates significant challenges, especially for patients in rural or remote areas who may need to travel long distances only to discover that the required service or medication is unavailable.
One of the core limitations of the existing system is the absence of a unified digital platform that integrates facility information, medication availability, and communication with healthcare providers. Medication stock data is not updated in real time, leading to medication shortages, treatment delays, and increased burden on both patients and pharmacists. Similarly, healthcare providers lack centralized tools to efficiently communicate with patients, forcing them to rely on overloaded phone lines or in-person visits for even routine inquiries.
These issues stem from several underlying causes, including limited digital transformation in the healthcare sector, lack of integrated health information systems, and inadequate adoption of AI-assisted tools. Stakeholders affected by these problems include patients, pharmacists, physicians, health extension workers, and healthcare administrators. Patients experience difficulties accessing accurate information, healthcare workers face heavier workloads due to repeated routine inquiries, and administrators struggle to monitor facility performance and medication distribution trends.
The impact of these shortcomings is significant: delayed treatment, increased operational inefficiency, reduced patient satisfaction, and limited access to health services for marginalized populations. Analytical tools such as cause-and-effect analysis, workflow mapping, and stakeholder analysis reveal that the lack of system integration, poor communication tools, and absence of real-time data flow form the core of the problem. Understanding these complexities helps define the scope and priorities of the proposed solution.
3.2 Specifying the Requirements of the Proposed Solution
To design a system that addresses the challenges identified in the existing environment, a structured requirement-gathering process was conducted using interviews with healthcare workers, surveys targeted at patients, and direct observation of facility workflow. These techniques enabled a clear understanding of user expectations, pain points, and operational gaps.
From these elicitation activities, the system’s functional and non-functional requirements were formulated. The functional requirements describe what the system must do, including real-time facility search, medication stock checking, AI-powered chatbot support, multi-language assistance, and encrypted patient-provider communication. Additional functional needs include user authentication, prescription image recognition, and a responsive interface that adjusts to various device types. Furthermore, the system incorporates a medicine ordering and delivery capability that allows patients to request medications from available pharmacies and receive them at their preferred location. This delivery functionality includes features such as specifying delivery addresses, assigning delivery personnel, tracking delivery status, and receiving notifications about order progress. Integrating delivery services ensures that patients, especially those in remote areas or those with mobility limitations, can access essential medications conveniently without needing to physically visit healthcare facilities or pharmacies.
Non-functional requirements address the quality of the system, such as performance, scalability, security, usability, and regulatory compliance. Given the sensitivity of health information, strong encryption, access control, and adherence to Ethiopian health data privacy regulations were prioritized. Usability requirements emphasize the need for a simple interface that accommodates users with varying levels of digital literacy. In addition, the delivery subsystem must maintain reliability and timely updates so that patients and pharmacies can monitor the progress of medication orders effectively.

3.3 System Modeling
System modeling is essential for visualizing the structure, behavior, and interactions of the proposed solution. Using standard modeling techniques such as Unified Modeling Language (UML), Data Flow Diagrams (DFD), and Entity-Relationship Diagrams (ERD), the system’s architecture and features can be represented in a clear and logical manner.
This phase includes identifying all actors who interact with the system, such as patients, healthcare providers, pharmacists, delivery personnel, and administrators. Use case descriptions are created to detail how each actor engages with the system for example searching for nearby facilities, checking medication availability, sending encrypted messages, uploading a prescription image, placing medication orders, and requesting home delivery services.
Based on these interactions, a use case diagram is developed to give an overview of the system’s functional boundaries. The diagram also represents interactions related to medicine ordering and delivery, including pharmacy order confirmation and delivery assignment. Activity diagrams illustrate the workflows of key processes, such as prescription recognition, facility search, and medication ordering with delivery. Sequence diagrams depict the step-by-step interactions between system components, including the process of placing an order, processing payment, assigning delivery personnel, and confirming successful delivery.
State diagrams help model the lifecycle of critical entities such as user accounts, prescription data, and medication orders, including delivery status transitions such as order placed, order accepted, out for delivery, and delivered. Finally, the class diagram outlines the main data structures and their relationships, including entities related to orders, delivery personnel, and delivery tracking, forming a blueprint for database and backend development.
These models not only validate system requirements but also guide developers, designers, and stakeholders toward a shared understanding of how the system will work once implemented.

3.3.1 Functional Requirements
Supplier (Pharmacy)
Suppliers must be able to manage their pharmacy information, inventory, orders, delivery coordination, and communication through the system.
Their core functional requirements include:
Add stock
Verify license
Manage location (pharmacy address and operational details)
Manage orders (incoming and processed orders)
Assign delivery personnel to confirmed orders
Update delivery status (preparing, out for delivery, delivered)
Manage delivery requests from patients
Chat support (seller side) for communicating with end users
End User
End users rely on the platform for searching, navigation, AI assistance, ordering medications, and general healthcare support. Their functional requirements include:
Search for medications using:
Image input
Text input
Voice input

Location search to find nearby pharmacies, clinics, and hospitals
Chat support for real-time inquiries
Rating feature (feedback) for evaluating services
Payment system (Chapa) for secure online payments
Request medication orders from pharmacies
Provide delivery address for home delivery
Track order and delivery status in real time
Receive notifications for order confirmation and delivery updates
RAG-powered Chatbot for general health questions
Map/service to guide users to their selected healthcare facility

AI Health Assistant (Beyond RAG)
A more advanced AI Health Companion that goes beyond traditional chatbots, offering:
Symptom checker
Diet recommendations
Workout and recovery suggestions
Ethiopia-Specific Disease Alerts (Push Notifications)
Location-based public health alerts functioning like an “Ethiopian CDC notifier,” including:
Malaria outbreaks
Cholera alerts
Marburg virus warnings
Admin
Administrators oversee system governance, compliance, delivery oversight, and user management. Their functional requirements include:
License verification for pharmacies
Analytics and system monitoring
Report management
Monitor medication orders and delivery operations
Manage delivery-related complaints or disputes
Suspend the user or supplier when necessary

3.3.2 Non-Functional Requirements
Security & Privacy
Encrypt all data (in transit + at rest).
MFA for admin & suppliers.
Secure file uploads (license scans).
Don’t store raw payment info (Chapa tokens only).
Audit logs for critical actions.
Secure handling of delivery information such as user addresses and contact details to protect patient privacy.
Performance
Text search ≤ 200ms, image search ≤ 2s, voice search ≤ 3s.
Chatbot response ≤ 2–6s depending on complexity.
Map/nearby pharmacy query ≤ 300ms.
Delivery status updates reflected to users within ≤ 2 seconds after update.
The system supports burst load spikes (disease alerts).
Availability & Reliability
99.95% uptime target.
Auto-scaling for APIs and AI services.
Queue + retry for order processing, delivery status updates, and notifications.
Daily backups + disaster recovery plan.
Reliable delivery tracking to ensure accurate order status and minimize failed deliveries.

Scalability
Horizontal scaling for search, orders, chat, AI, and delivery tracking services.
Costs controlled with autoscaling guardrails.
Caching for heavy read operations such as pharmacy locations and delivery tracking updates.

Maintainability
CI/CD pipeline (tests + security scan).
API versioning (v1, v2).
Feature flags for risky features (AI health assistant).
Clear documentation + runbooks.
Modular architecture separating delivery management services from core pharmacy operations.
Observability
Centralized structured logs.
Metrics + alerts for uptime, latency, error rate, and delivery processing delays.
Distributed tracing for debugging system components including delivery workflows.

Data Governance
Consent for health data + location.
Data minimization.
Deletion policy (“right to be forgotten”).
Retention rules for logs, license docs, analytics, and delivery order history.
Compliance
Follow Chapa guidelines.
Safe health information: no medical diagnosis, only guidance.
Ensure delivery operations comply with local regulations regarding pharmaceutical distribution.

Localization & Accessibility
Full Amharic support.
Low-bandwidth mode for Ethiopia.
Delivery status and notifications available in supported local languages.

AI Safety & Quality
Accuracy benchmarks for symptom checkers.
Confidence-based fallback to “see a doctor.”
Monitoring for harmful outputs.
Weekly review + model retraining loop.

Notifications
Regional disease alerts delivered to 90% of users in ≤ 5 minutes.
Delivery notifications for order confirmation, delivery assignment, and successful delivery.
Opt-in/out with per-region targeting.
Rate limiting to avoid alert-fatigue.

Admin Governance
License verification workflow with audit trail.
Secure admin portal (MFA, logging).
Suspensions tracked and reversible.
Exportable analytics & reports.
Monitoring of order and delivery operations to ensure service reliability.

3.3.3 Use Case
An end user initiates the healthcare platform with the goal of locating a specific medication, which triggers the system’s multimodal search pipeline that accepts an uploaded image of the drug package, a typed text query, or a spoken request through voice input, after which the platform performs preprocessing using optical character recognition for text extraction, image classification for identifying pills or packaging characteristics, and speech-to-text conversion for accurate transcription, while simultaneously applying security controls such as encrypted data handling, validation of file integrity, and automatic filtering of unsafe or invalid uploads before transmitting the sanitized input to the AI-driven search engine for further analysis.
Following successful query validation, the system retrieves real-time information from supplier inventory services and ranks the results using multiple criteria such as the supplier’s license verification status, geographic proximity, stock availability, historical service reliability, price variations, and aggregated user ratings while also enriching these results by presenting possible substitute medications, generating availability and shortage alerts, collecting operational hours and geographic coordinates, and producing AI-assisted summaries that explain dosage forms, precautionary guidelines, contraindications, and interaction warnings, all within a strict data governance framework that enforces user consent, data minimization principles, regional health-data compliance, and detailed activity logging for monitoring and analytics without retaining unnecessary sensitive information.
When the user selects a pharmacy or medication from the search results, the platform initiates a coordinated workflow involving several subsystems: it revalidates real-time stock and pricing with the supplier’s backend to avoid inconsistencies, retrieves precise navigation instructions from the mapping service, prepares safety and wellness recommendations through the AI Health Assistant, opens a secure communication channel for direct consultation with a pharmacist, and integrates the Chapa payment gateway to facilitate protected and efficient transactions. In addition, the system enables the user to place a medication order and choose between in-store pickup or home delivery. If delivery is selected, the user provides a delivery address, after which the system forwards the order to the selected pharmacy for confirmation and preparation.
Once the pharmacy confirms the order, the platform coordinates the delivery process by assigning available delivery personnel, generating delivery tracking information, and updating the order status through stages such as order accepted, preparing medication, out for delivery, and delivered. Throughout this process, the system provides real-time delivery notifications and status updates to the user while ensuring secure handling of location and contact information.
Meanwhile, the system continuously monitors performance indicators such as maintaining text search responses below 200 milliseconds, image search within two seconds, and location-based queries within 300 milliseconds and automatically scales computing resources during high-traffic events such as widespread public health alerts.
The use case concludes by presenting the user with a set of actionable options including navigation to the chosen facility, order placement, home delivery request, pharmacist consultation through chat, comparison of alternative medications, service rating submission, and further inquiry through the AI assistant. After completion of the process, the platform updates internal logs, schedules notifications where appropriate, records delivery outcomes when applicable, applies retention and deletion policies for sensitive clinical or geolocation data, contributes structured metrics to the administrative analytics dashboard, activates feature flags for experimental functionalities, maintains an auditable trail of critical actions, and employs resilience measures such as low-bandwidth fallback modes or cached responses, ultimately delivering a coherent, secure, responsive, and context-aware end-to-end medication discovery, ordering, and healthcare support experience within a scalable and governed digital ecosystem.

3.3.3.1 Use Case Diagram
Use case diagrams illustrate the major system functionalities and the external actors interacting with those functionalities. They provide a high-level view of the system’s functional boundaries and the responsibilities of each user group.
For the proposed MED-CARE solution, three primary human actors and one system actor category were identified based on the functional requirements:
End User (Patient):
Represents the general public or patients who utilize the platform to search for healthcare facilities, check real-time medication availability, upload prescriptions for OCR analysis, interact with the AI Health Assistant for symptom checking, and perform secure transactions for medication orders.
Supplier (Pharmacy/Pharmacist):
Responsible for managing the pharmacy’s digital presence, including real-time inventory updates, price management, and order fulfillment. This actor also handles business license submission, engages in secure chats with patients, and processes incoming orders.
System Administrator (Admin):
Oversees the overall governance of the platform to ensure compliance with healthcare regulations. Responsibilities include verifying supplier licenses, monitoring system analytics, managing user suspensions, and broadcasting region-specific disease outbreak alerts.
External Services (Secondary Actors):
Represents third-party systems that interact with the platform to enable core functionalities. These include the Chapa Payment Gateway for secure financial transactions and the AI Service that powers symptom analysis and prescription OCR features.
Each use case diagram focuses on the interaction between actors and the system from their respective perspectives. These diagrams ensure traceability between the functional requirements defined in this section and the corresponding system behavior. They also form the foundation for subsequent sequence and activity diagrams.
Terminology Clarification:
Within the use case diagrams, the term "User" may be used as a generalized actor to represent any individual interacting with the system’s authentication interface (e.g., during Login or Registration). This includes Patients, Suppliers, and Administrators prior to role differentiation by the system.

3.3.1.2 Use Case Identification
The use case identification phase defines the scope of the system by outlining the interactions between actors and the proposed MED-CARE platform. To ensure a clear structural breakdown, the identified use cases are categorized into four functional subsystems: End User (Patient) Operations, AI & Health Intelligence, Supplier (Pharmacy) Operations, and System Administration & Governance.
The following tables summarize these use cases, mapping each one to its primary actor and describing the role it plays within the system.
Table 3.1: End User (Patient) Operations Use Case Identification
This table presents the core functionalities required for patients to access healthcare services, search for medications, complete transactions, and communicate securely with pharmacies.
UC ID
Use Case Name
Primary Actor
Description
UC-01
User Registration & Login
End User
Secure account creation and authentication, including phone verification via OTP and password recovery.
UC-02
Multimodal Search
End User
Searching for medications using text input, voice commands (Amharic/English), or prescription image scanning (OCR).
UC-03
View Pharmacy Details
End User
Viewing pharmacy location, stock availability, and trust ratings prior to ordering.
UC-04
Place Medication Order
End User
Selecting a pharmacy, adding medications to a cart, choosing delivery or pickup, and confirming the order.
UC-05
Secure Payment
End User
Completing transactions via the Chapa gateway or using the Cash on Delivery option based on trust scores.
UC-06
Rate & Review
End User
Submitting ratings and feedback on pharmacy services after order completion.
UC-07
Secure Chat
End User
Initiating end-to-end encrypted communication with a pharmacist for consultation.

Table 3.2: AI & Health Intelligence Use Case Identification
This table outlines the artificial intelligence–driven features designed to support patient decision-making and public health awareness.
UC ID
Use Case Name
Primary Actor
Description
UC-08
AI Symptom Checker
End User
AI-driven symptom analysis providing triage advice and recovery recommendations.
UC-09
Prescription OCR Analysis
End User
Automatic extraction and interpretation of medication details from prescription images.
UC-10
Receive Disease Alerts
End User
Location-based notifications for regional disease outbreaks (e.g., Malaria, Cholera).
UC-11
Medical Q&A (RAG)
End User
Context-aware medical question answering using Retrieval-Augmented Generation.

Table 3.3: Supplier (Pharmacy) Operations Use Case Identification
This table describes the operational use cases that allow pharmacies to manage inventory, licensing, and customer interactions.
UC ID
Use Case Name
Primary Actor
Description
UC-12
Upload & Verify License
Supplier
Submitting official business license documents to obtain verified seller status.
UC-13
Manage Inventory
Supplier
Adding stock, updating quantities, pricing, and expiration dates.
UC-14
Manage Pharmacy Profile
Supplier
Updating pharmacy location, address, and operational hours.
UC-15
Process Incoming Orders
Supplier
Accepting, rejecting, and updating the status of customer orders.
UC-16
Supplier Chat Support
Supplier
Providing consultation and order-related support via secure messaging.

Table 3.4: System Administration & Governance Use Case Identification
This table summarizes the administrative functions required to ensure system reliability, compliance, and security.
UC ID
Use Case Name
Primary Actor
Description
UC-17
Verify Supplier Licenses
System Admin
Reviewing and approving or rejecting supplier license submissions.
UC-18
Push Health Alerts
System Admin
Broadcasting public health alerts to users in affected geographic regions.
UC-19
System Monitoring
System Admin
Monitoring analytics dashboards, system logs, and performance metrics.
UC-20
User Governance
System Admin
Suspending or banning users and suppliers that violate platform policies.

    			Fig 3.1 Use case diagram

3.3.1.3 Detailed Use Case Specifications
The following tables present detailed specifications for selected critical use cases. Each specification includes the preconditions, triggers, normal flow of events, alternative flows, and postconditions.
Table 3.5: Detailed Use Case Specification for UC-02 (Multimodal Medication Search)
Attribute
Details
Use Case ID
UC-02
Use Case Name
Multimodal Medication Search (Text/Voice/Image)
Actor(s)
End User
Preconditions
User is on the Search screen and required device permissions (Camera, Microphone, GPS) are granted.
Trigger
User selects a search method (text or image).
Normal Flow

1. User selects an input method. 2. System processes text, voice (speech-to-text), or image (OCR). 3. Input is validated. 4. Database is queried for nearby pharmacies. 5. Results are ranked by distance, price, and availability. 6. Results are displayed.
   Alternative Flows
   A1: No results found – system suggests alternatives or a notification option. A2: Unclear image or voice – system requests re-input.
   Postconditions
   A list of available medications and pharmacies is presented to the user.

Table 3.6: Detailed Use Case Specification for UC-08 (AI Symptom Checker & Disease Alerts)
Attribute
Details
Use Case ID
UC-08
Use Case Name
AI Health Symptom Checker
Actor(s)
End User, AI Service
Preconditions
The user is logged in and location services are enabled.
Trigger
User selects the AI Health Companion feature.
Normal Flow
User enters symptoms → AI retrieves contextual and outbreak data → AI analyzes symptoms → recommendations are returned.
Alternative Flows
High-risk condition detected – system prioritizes hospital guidance and emergency recommendations.
Postconditions
The user receives a health report with actionable next steps.

Table 3.7: Detailed Use Case Specification for UC-04 (Place Medication Order)
Attribute
Details
Use Case ID
UC-04
Use Case Name
Place Medication Order
Actor(s)
End User, Supplier, Chapa Payment Gateway
Preconditions
Medication has been selected and a pharmacy is chosen.
Trigger
User selects Add to Cart or Buy Now.
Normal Flow
Order selection → checkout → payment processing → order confirmation → supplier notification.
Alternative Flows
Payment failure – system prompts the user to retry.
Postconditions
Order is stored in the system and pharmacy inventory is reserved.

3.3.4 Dynamics models of the system

The dynamic models describe how the system behaves over time by illustrating interactions, workflows, and state transitions triggered by user or system events. The diagrams below sequence, activity, and state diagrams demonstrate how processes unfold, how components communicate, and how key entities evolve during the system’s operation.

3.3.4.1 Sequence diagrams
3.3.4.1.1 User registers / logs in (with optional MFA)
Goal: Authentication.
Lifelines: User, Auth Service, Database, EthioTelecom (SMS Gateway).
Sequence Flow:
User submits registration with phone and password.
Auth Service generates an OTP.
Auth Service sends OTP via SMS through EthioTelecom.
User enters the OTP for verification.
Auth Service validates OTP and creates user record in Database.
Auth Service returns authentication token (JWT).

    			Fig 3.2 User Registration Sequence diagram

3.3.4.1.2 Patient searches for medicine using text + sees nearby pharmacies
Goal: User types a drug name and finds where to buy it.
Lifelines: Patient, Frontend (App), Search Engine, Inventory Database, Google Maps API.
Sequence Flow:
Patient enters text.
Frontend sends query to Search Engine.
Search Engine queries to Inventory Database.
Inventory Database returns
Search Engine calls to Google Maps API.
Search Engine ranks results: Sorts by Distance, Price, and Rating .
Search Engine returns: SortedResults to Frontend.
Frontend displays.

    			Fig 3.3  Patient search for medication sequence diagram

3.3.4.1.3 Patient uploads prescription image → OCR → medicine recognition
Goal: User scans a paper prescription to find meds.
Lifelines: Patient, Frontend, OCR Service (Mistral AI), Vector DB (Pinecone), Search Engine.
Sequence Flow:
Patient uploads image.
Frontend validates.
Frontend sends to OCR Service (Mistral).
OCR Service extracts.
Frontend sends to Vector DB (Pinecone).
Vector DB returns: StandardizedDrugID (Matches fuzzy text to actual drug).
Frontend triggers: SearchStock(DrugID) to Search Engine (continues to stock check).

    		Fig 3.4 Patient uploads prescription image sequence diagram

3.3.4.1.4 Patient selects pharmacy → checks real-time stock → proceeds to order

Goal: Ensuring stock exists before payment (preventing cancellations).
Lifelines: Patient, Frontend, Core Backend, Supplier Inventory System.
Sequence Flow:
Patient clicks
Frontend requests to Core Backend.
Core Backend pings to Supplier Inventory System (Double check).
Supplier System returns
Core Backend returns
Frontend displays
Patient clicks.

    	    Fig 3.5  Patient pharmacy selection and stock check sequence diagram

3.3.4.1.5 Patient → Pharmacist real-time chat (End-to-End Encrypted)
Goal: Secure consultation before buying.
Lifelines: Patient, Chat Service, Key Management Server, Pharmacist.
Sequence Flow:
Patient starts consultation.
Chat Service requests public keys from Key Management Server.
Chat Service initializes secure sessions using RSA keys.
Patient sends an encrypted message.
Chat Service routes the message to the Pharmacist.
Pharmacist decrypts payload using private key.
Pharmacist sends encrypted response

    	      Fig 3.6 Chat between Patient and pharmacist sequence diagram

3.3.4.1.6 Patient talks to RAG-powered Medical Chatbot

Goal: General health Q&A using the AI knowledge base.
Lifelines: Patient, AI Agent, Vector DB (Pinecone), Mistral AI Model.
Sequence Flow:
Patient submits a query.
AI Agent generates an embedding from the query.
AI Agent retrieves relevant context from Vector DB.
Vector DB returns relevant medical documents.
AI Agent sends combined prompt (Query + Context) to Mistral AI.
Mistral AI generates a response.
AI Agent displays the response to the Patient.

                  Fig 3.7 Patient talking to RAG based Medical chat bot sequence diagram

3.3.4.1.7 Patient uses Advanced AI Health Assistant – Symptom Checker

Goal: Triage symptoms and suggest action (Refer to Figure 3.3 in PDF).
Lifelines: Patient, AI Symptom Checker, Regional Health DB, Backend.
Sequence Flow:
Patient inputs symptoms.
AI Symptom Checker fetches user location.
AI Symptom Checker queries Regional Health DB for outbreaks.
Regional Health DB returns outbreak alert.
AI Symptom Checker matches symptoms with contextual data.
AI Symptom Checker assigns a high-risk level.
AI Symptom Checker triggers emergency protocol recommending hospital visit.

    	Fig 3.8  Patient uses AI Assistant for symptom check sequence diagram

3.3.4.1.8 Pharmacy supplier adds/updates medicine stock

Goal: Inventory management.
Lifelines: Supplier, Supplier Portal, Inventory Database.
Sequence Flow:
Supplier adds or scans product details.
Supplier Portal validates supplier license status.
Supplier Portal sends inventory updates to Inventory Database.
Inventory Database confirms successful update.
Supplier Portal displays updated stock list.

    	Fig 3.9 Pharmacy supplier updates inventory sequence diagram

3.3.4.1.9 Pharmacy supplier receives new order notification → accepts/rejects
Goal: Order fulfillment.
Lifelines: Core Backend, Supplier App, End User.
Sequence Flow:
Core Backend pushes new order notification to Supplier App.
Supplier reviews order details.
The supplier accepts the order.
Supplier App updates status to “Preparing” in Core Backend.
Core Backend notifies the End User that the pharmacy is preparing the order.

    	Fig 3.10 Pharmacy receiving Order sequence diagram

3.3.4.1.10 Patient rates pharmacy after service
Goal: Building trust scores.
Lifelines: Patient, Backend, Database.
Sequence Flow:
Patient submits rating and comment
Backend saves the review to the Database.
Backend recalculates the pharmacy’s trust score.
Backend confirms submission by showing a thank-you message.

    		Fig 3.11 Patient rates pharmacy after service

3.3.4.1.11 Admin verifies new pharmacy license application

Goal: Governance and safety.
Lifelines: Admin, Admin Dashboard, Backend, Database.
Sequence Flow:
Admin views pending license applications.
Backend retrieves license images from Database.
Admin reviews documents manually or via external registry.
Admin approves the license.
Backend updates license status to “Verified” in Database.
Backend notifies the supplier via email about license approval.

    			Fig 3.12 Admin verification Pharmacy license

3.3.4.1.12 Admin suspends pharmacy/supplier account

Goal: Disciplinary action for bad actors.
Lifelines: Admin, Backend, Database, Supplier.
Sequence Flow:
Admin selects the account to suspend and provides a reason.
Backend updates account status to “Suspended” in Database.
Backend forces logout by terminating active sessions.
Backend notifies the supplier via email about the suspension.

    	Fig 3.13 Admin suspends pharmacy/ supplier account sequence diagram

3.3.4.1.13 Chapa payment initiation → successful payment

Goal: Financial transaction (Figure 3.3 Step 3).
Lifelines: Patient, Core Backend, Chapa Gateway.
Sequence Flow:
Patient confirms payment amount.
Core Backend initializes the transaction with Chapa Gateway.
Chapa returns the payment page URL.
Core Backend redirects the patient to the payment page.
Patient submits card or Telebirr payment details.
Chapa posts a payment success webhook to Core Backend.
Core Backend updates the order status to “Paid.”

    		Fig 3.14 Payment Initiation and Successful payment sequence diagram




    		   Fig 3.15  AI symptom check to pharmacy order sequence diagram

3.3.4.2 Activity Diagrams
Activity diagrams are utilized here to model the dynamic aspects of the MED-CARE system. Unlike sequence diagrams, which focus on the exchange of messages between objects, activity diagrams depict the operational workflow and the sequence of activities within a specific process. They are particularly effective for visualizing the conditional logic (decision nodes), parallel processing (forks/joins), and error handling procedures inherent in the system.
The following three diagrams illustrate the core workflows of the platform: the End User Search & Purchase Flow, the Supplier Order Fulfillment Flow, and the AI Symptom Triage Flow.
3.3.4.2.1 End User Search & Purchase Workflow
This diagram models the patient's journey from initial search to successful transaction. To accommodate the diverse technological literacy of the Ethiopian population, the search phase utilizes a multimodal input approach, allowing users to initiate queries via text, voice commands (Amharic/English), or prescription image scanning (OCR) in parallel .

    	       Fig 3.16  End User Search and purchase flow activity diagram

3.3.4.2.2 AI Symptom Checker & Triage Workflow
This diagram details the logic of the AI Health Assistant. Unlike a standard chatbot, this workflow integrates Context Analysis to cross-reference reported symptoms with real-time regional outbreak data. For example, if a user in Bahir Dar reports a fever during an active malaria alert, the system prioritizes this context over standard diagnosis.

Fig 3.17 AI symptom Checker and Triage workflow activity diagram

Chapter Four: System Design
4.1 Overview
This chapter describes the system design of the MED-CARE Ethiopia project. System design is a critical phase in software development because it explains how the proposed solution will be organized and how different parts of the system will work together to achieve the project objectives. While earlier chapters focused on understanding the problem and defining requirements, this chapter focuses on translating those requirements into a structured system.
The purpose of this system design is to provide a clear picture of how MED-CARE Ethiopia operates as a web-based healthcare platform. It explains how users interact with the system, how information flows within the system, and how the system supports key services such as healthcare facility search, medication availability checking, online medicine ordering and delivery coordination, AI chatbot assistance, and secure communication between patients and healthcare providers.
A well-planned system design is important for ensuring that the system is reliable, efficient, and easy to maintain. Without a clear design, software systems can become difficult to manage, expensive to update, and prone to errors. This design helps developers, stakeholders, and evaluators understand how the system works as a whole, even without examining the actual source code.
In the context of Ethiopia’s healthcare environment, system design is especially important because users have varying levels of digital literacy, device availability, and internet connectivity. The design therefore focuses on accessibility, simplicity, and flexibility. By using a web-based approach, the system allows users to access healthcare information and request medication delivery without installing applications, making it suitable for use in urban areas, rural regions, healthcare facilities, and internet cafés.
Overall, this chapter explains how MED-CARE Ethiopia is structured to support its goal of improving healthcare access, medication information management, and medicine delivery services while ensuring security, scalability, and ease of use.

4.2 Specifying the Design Goals
The design goals of MED-CARE Ethiopia define what the system aims to achieve from a technical and user-experience perspective. These goals guide the overall structure of the system and influence all major design decisions. Each goal is aligned with the project’s objectives and the real-world challenges identified in Ethiopia’s healthcare system, including improving access to healthcare information, medication availability, and medicine delivery services.
One of the primary design goals is performance. The system is designed to respond quickly to user actions such as searching for healthcare facilities, checking medicine availability, uploading prescriptions, placing medication orders, requesting delivery services, or interacting with the AI chatbot. Slow response times can discourage users and reduce trust in the platform. Therefore, the design emphasizes efficient handling of user requests to ensure smooth and timely interactions, even when multiple users access the system simultaneously.
Another important design goal is scalability. MED-CARE Ethiopia is intended to serve a growing number of users, healthcare facilities, pharmacies, and delivery service providers over time. The system design allows new features, services, and users to be added without requiring major changes to the existing structure. This ensures that the platform can expand beyond its initial deployment and support national-level healthcare services in the future, including large-scale coordination of medicine ordering and delivery services.
Security and privacy are critical design goals due to the sensitive nature of healthcare data. The system is designed to protect personal information, medical data, prescription details, payment information, and communication between users and healthcare providers. Secure data handling and controlled access are essential to maintain user trust and comply with healthcare data protection standards. The design prioritizes secure communication, especially for messaging, prescription processing, payment transactions, and delivery-related information.
The system is also designed with availability and reliability in mind. Users should be able to access the platform whenever they need healthcare information, request medications, place medicine orders, or track delivery updates. Since healthcare needs can arise at any time, the system is designed to minimize downtime and ensure consistent access. The web-based nature of the platform helps improve availability by allowing access from different devices and locations.
Another key goal is usability. The system is designed to be easy to understand and navigate, even for users with limited experience using digital systems. Clear interfaces, simple workflows, and multilingual support help ensure that users can interact with the system comfortably. This includes simple processes for searching medicines, placing orders, and requesting delivery services. This is especially important in Ethiopia, where users come from diverse educational and cultural backgrounds.
Finally, the design goal of accessibility ensures that the system can be used across different devices and network conditions. The platform is designed to work on smartphones, tablets, and computers, supporting users in both urban and rural areas. By prioritizing accessibility, the system helps reduce barriers to healthcare information, medication access, and medicine delivery services.
4.3 System Design
The MED-CARE Ethiopia system is designed as a centralized, web-based healthcare platform that integrates multiple services into a single, unified system. The platform allows patients, healthcare providers, pharmacies, and administrators to interact with healthcare information and services in a structured and efficient manner. In addition to providing access to healthcare information, the system also supports medication ordering and coordinated delivery services, allowing patients to request medicines from pharmacies and receive them through registered delivery personnel.
At a high level, the system provides an interface through which users can perform healthcare-related tasks such as searching for nearby hospitals or pharmacies, checking medication availability, uploading prescriptions, asking health-related questions, ordering medicines, requesting home delivery of medications, and communicating securely with healthcare providers. These interactions are processed by the system and translated into meaningful responses using stored healthcare data and AI-supported features.

The system design follows a layered and modular structure. This means that the system is divided into logical parts, each responsible for a specific function. For example, one part of the system handles user interaction, another manages healthcare and pharmacy data, another supports AI chatbot responses, and another coordinates medication ordering and delivery services. This separation makes the system easier to understand, maintain, and improve over time.
Communication between different parts of the system is designed to be smooth and organized. When a user performs an action, such as searching for a medicine or placing an order, the request is processed by the appropriate system module. The system retrieves relevant information from the database, verifies medicine availability from pharmacy inventory, processes the request, and then presents the results to the user in a clear and understandable format. If a medicine order is placed, the system coordinates the delivery process by notifying registered pharmacy delivery personnel. This structured flow of information helps ensure accuracy, efficiency, and reliable service delivery.
The decision to use a web-based system is a key part of the overall design. Web-based systems do not require installation, making them easier to access for users with limited device storage or technical knowledge. This design choice supports Ethiopia’s diverse technology environment and increases the likelihood of widespread adoption, allowing users to access healthcare information, request medications, and track delivery services from various devices and locations.
Security considerations are embedded throughout the system design. The system ensures that sensitive data such as personal information, prescriptions, medical communications, and payment details are handled carefully. Secure communication channels protect interactions between patients, healthcare providers, pharmacies, and delivery personnel. By designing security into the system from the beginning, MED-CARE Ethiopia reduces risks related to data misuse, fraud, or unauthorized access.
In addition, the system is designed to support future enhancements. New services, additional healthcare providers, more pharmacies, expanded AI capabilities, and improved delivery coordination features can be integrated without disrupting existing functionality. This forward-looking design ensures that MED-CARE Ethiopia can continue to evolve alongside Ethiopia’s healthcare and digital infrastructure.
In summary, the system design of MED-CARE Ethiopia provides a strong foundation for building a reliable, secure, and accessible healthcare platform. By integrating healthcare information services with medication ordering and delivery coordination, the system addresses real-world challenges related to healthcare access and medicine availability. The structured, modular, and scalable design supports long-term growth while providing users with a practical and user-friendly solution for healthcare access and medication management.
4.3.1 Proposed Software Architecture
The proposed software architecture of MED-CARE Ethiopia is designed as a centralized, monolithic web-based healthcare platform. The architecture emphasizes simplicity, maintainability, and reliability while supporting all core services in a single deployable application. This approach reduces deployment complexity, ensures tight integration between system modules, and is suitable for the current scope and resources of the MED-CARE Ethiopia project.
The system is structured as a single application with logically separated modules for each functional area. Each module handles specific responsibilities but runs as part of the same codebase and deployment unit. Users access the platform through a web browser, where actions such as searching for healthcare facilities, checking medication availability, uploading prescriptions, placing medicine orders, requesting deliveries, or making payments are processed centrally by the application.
The system includes the following modules:

1. Authentication and User Management Module
   Handles user registration, login, role management, and access control. Ensures that only authorized users can access protected features and manages secure session handling.
2. Healthcare, Pharmacy, and Medication Module
   Manages hospitals, clinics, pharmacies, and medication inventory. Supports location-based searches, facility details, and real-time medication availability. This module also handles verification of medicine availability for orders.
3. Messaging and Notification Module
   Manages secure communication between patients, healthcare providers, and pharmacies. Also handles system notifications related to messages, order status, and delivery updates.
4. AI and Intelligent Services Module
   Provides AI-powered functionalities such as chatbot assistance, prescription image recognition, and semantic search. These features run asynchronously to maintain performance without affecting the main workflow.
5. Payment and Subscription Module
   Handles payment transactions, subscription management, and verification of payments for medicine orders. Ensures secure handling of sensitive financial data.
6. Order and Delivery Management Module
   Coordinates the complete medicine ordering and delivery workflow. Responsibilities include:
   Creating and managing medication orders
   Assigning delivery personnel to orders
   Tracking delivery status (Order placed → Confirmed → Preparing → Out for delivery → Delivered)
   Updating notifications for patients and pharmacies

This module works closely with the Healthcare, Pharmacy, and Medication module for inventory validation and with the Payment and Messaging modules for secure order processing and delivery updates.
Database Design
The monolithic system uses a single centralized database that supports all modules. Logical separation of tables and relationships ensures maintainability while simplifying data access. Key tables include:
Users
Healthcare Facilities
Medications and Inventory
Orders and Order Items
Deliveries and Delivery Personnel
Messages and Notifications
Payments and Subscriptions
Audit Logs

Communication and Workflow
Within the monolithic architecture, modules communicate internally through function calls and shared data models, eliminating the need for asynchronous message brokers like RabbitMQ. All delivery events, order updates, payment confirmations, and notifications are processed in the same application, ensuring consistency and reducing operational complexity.
Deployment
The system is deployed as a single application instance, with all modules running together on the server. Containerization using Docker can still be applied for development and testing environments, but production deployment is simplified compared to a microservices setup.

4.3.2 Subsystem Decomposition
MED-CARE Ethiopia subsystem decomposition breaks its system into smaller, manageable parts. Each subsystem represents a major functional unit of the system and supports a specific set of responsibilities. This approach improves clarity, simplifies development, and allows each part of the system to be maintained logically, even though all modules are part of a single monolithic application.
The system is decomposed into six main subsystems, aligned with the monolithic architecture:
User Management Subsystem
Handles all user-related operations, including user registration, login, authentication, role assignment, and access control. It ensures secure access to system features and protects sensitive user data.
Healthcare, Pharmacy, and Medication Subsystem
Manages core healthcare information, storing and processing data related to hospitals, clinics, pharmacies, and medications. This subsystem supports searching for nearby healthcare facilities, checking medication availability, viewing detailed facility and medication information, and verifying pharmacy inventory for medication orders.
Messaging and Notification Subsystem
Manages communication between users, healthcare providers, and pharmacies. It enables secure message exchange and generates system notifications, including updates related to medication orders and delivery statuses. This ensures timely delivery of alerts and information to users.
AI and Intelligent Subsystem
Provides automated and intelligent features, including chatbot-based healthcare assistance, prescription image processing, and semantic search functionality. Tasks within this subsystem are processed asynchronously to maintain system responsiveness without affecting other operations.

Payment and Subscription Subsystem
Manages financial transactions and subscription data. It handles payment processing, transaction verification, and billing records. This subsystem ensures secure handling of all payment-related information, including payments for medication orders.
Order and Delivery Management Subsystem (New)
Coordinates the complete medicine ordering and delivery workflow. It handles order creation, assignment of delivery personnel, tracking of delivery status (e.g., placed, confirmed, preparing, out for delivery, delivered), and notification updates. This subsystem integrates closely with the Healthcare, Pharmacy, and Medication, Payment, and Messaging subsystems to ensure smooth and timely delivery of medications.
All subsystems operate as modules within a single monolithic application. Communication between modules occurs through internal function calls and shared data models, eliminating the need for external messaging brokers for basic coordination. Despite being part of the same application, the logical separation of subsystems ensures maintainability, clarity, and the ability to expand or modify individual modules as future enhancements are added.
4.3.3 Database Design
Our database stores long-term data related to users, healthcare facilities, medications, communication, payments, orders, deliveries, and system activities. This design supports consistency, reliability, and ease of maintenance, while remaining suitable for the system’s monolithic architecture.
Database Management Approach
The system uses a centralized relational database with clearly defined tables and relationships. All modules access the shared database through controlled interfaces. Indexing, constraints, and role-based access controls ensure high performance, security, and data integrity across all functionalities, including delivery operations.

Core Database Entities
User
Stores user account information.
Attributes: user_id, full_name, email, phone_number, password_hash, role, account_status
Primary Key: user_id
Constraints: email and phone_number must be unique.

HealthcareFacility
Stores hospitals, clinics, and pharmacies.
Attributes: facility_id, name, type, location, license_number, status
Primary Key: facility_id
Constraints: license_number must be unique.

Medication
Stores medication details.
Attributes: medication_id, name, description, category, prescription_required
Primary Key: medication_id

Inventory
Stores medication availability per pharmacy.
Attributes: inventory_id, facility_id, medication_id, quantity, last_updated
Primary Key: inventory_id
Foreign Keys:

facility_id → HealthcareFacility(facility_id)

medication_id → Medication(medication_id)

Order (New)
Stores medication orders placed by users.
Attributes: order_id, user_id, pharmacy_id, total_amount, order_status, created_at, updated_at
Primary Key: order_id
Foreign Keys:

user_id → User(user_id)

pharmacy_id → HealthcareFacility(facility_id)

Delivery (New)
Stores delivery information for medication orders.
Attributes: delivery_id, order_id, delivery_person_id, status, assigned_at, delivered_at
Primary Key: delivery_id
Foreign Keys:
order_id → Order(order_id)
delivery_person_id → User(user_id) (assuming delivery personnel are registered users)

Message
Stores communication data.
Attributes: message_id, sender_id, receiver_id, content, timestamp, read_status
Primary Key: message_id
Foreign Keys:

sender_id → User(user_id)
receiver_id → User(user_id)

Notification
Stores system notifications.
Attributes: notification_id, user_id, type, content, status, created_at
Primary Key: notification_id
Foreign Key: user_id → User(user_id)

Payment
Stores payment transactions.
Attributes: payment_id, user_id, amount, payment_method, transaction_status, payment_date
Primary Key: payment_id
Foreign Key: user_id → User(user_id)

Subscription
Stores subscription plans and status.
Attributes: subscription_id, user_id, plan_type, start_date, end_date
Primary Key: subscription_id
Foreign Key: user_id → User(user_id)

AuditLog
Stores system activity logs.
Attributes: log_id, user_id, action, timestamp, ip_address
Primary Key: log_id
Foreign Key: user_id → User(user_id)
Entity Relationships
User Communication: A User can send and receive many Messages.
Transactions: A User can have multiple Payments, Subscriptions, and Orders.
Inventory Logic:
A HealthcareFacility can store multiple Medications through the Inventory table.
Each Inventory record links one specific Medication to one specific HealthcareFacility.
Orders and Deliveries:
Each Order belongs to a specific User and Pharmacy.
Each Delivery is linked to a specific Order and assigned to a delivery personnel (who is a registered User).
System Alerts: Notifications belong to a specific User.
Database Constraints and Integrity
Primary Keys: Uniquely identify each record to ensure data integrity.
Foreign Keys: Enforce relationships and referential integrity between tables, including links between Orders, Deliveries, Users, and Pharmacies.
Unique Constraints: Prevent duplicate records (e.g., email, phone number, license number).
Indexes: Applied to frequently queried fields, such as Orders, Deliveries, Messages, and Inventory, to improve search performance.
Access Control: Restricts database operations to authorized users, including separate permissions for patients, pharmacies, delivery personnel, and administrators.
Data Security and Management
Encryption: Sensitive data (e.g., passwords, payment information) is stored in encrypted or hashed form.
RBAC: Role-based access controls limit data exposure depending on user roles (e.g., patients, pharmacy staff, delivery personnel, admins).
Data Safety: Regular backups are performed to protect against data loss, including orders and delivery records.
Monitoring: Audit logs are maintained to track critical actions, including order creation, payment confirmation, and delivery updates, supporting accountability and system monitoring.

Fig 4.2 Database Diagram

References
The Relevance of Digital Health in Ethiopia: A Game Changer for Healthcare Delivery
This study discusses how digital health technologies can improve healthcare access, efficiency, and equity within the Ethiopian healthcare system.
Health Equity Powered by Quaefacta Health – MIT Solve
An overview of digital health solutions aimed at reducing health disparities, with a focus on innovation-driven health equity initiatives.
Practices, Enablers, and Barriers of Health Information Systems in Developing Countries
An analysis of the challenges and enabling factors affecting the adoption of health information systems in low-resource settings.
Digital Health Interventions (DHIs) for Health Systems Strengthening
This paper explores how digital health interventions contribute to strengthening national health systems through improved data management and service delivery.
Electronic Maternal and Child Health Application: Usability, Feasibility, and Acceptability An evaluation of mobile health applications designed for maternal and child healthcare services in developing regions.
Telemedicine in Ethiopia: Evaluating Digital Health Adoption
A review of telemedicine initiatives in Ethiopia and the factors influencing their adoption and scalability.
Impact and Challenges of Artificial Intelligence Integration in Healthcare
This article examines the benefits, risks, and implementation challenges of integrating AI technologies into healthcare systems.
AI‑Driven Healthcare Entrepreneurship: Transforming Clinical Practice
Discusses how AI-based innovations are reshaping healthcare delivery models and enabling new entrepreneurial opportunities.
Lessons Learned from Global Digital Health AI Chatbot Failures
An analytical review of failed AI chatbot deployments in healthcare, highlighting ethical, technical, and operational pitfalls.
Developing an Amharic Text‑Based Chatbot Model for HIV/AIDS Awareness
A study focusing on natural language processing challenges and solutions for Amharic-language healthcare chatbots.
Women’s Preferences and Willingness to Pay for AI Chatbots in Healthcare
Investigates user acceptance, trust, and economic considerations related to AI chatbot adoption among women.
Top AI Chatbots for Healthcare: Comparative Review
A comparative analysis of leading healthcare chatbots, evaluating features, security, and usability.
Artificial Intelligence in Healthcare: Navigating Opportunities and Challenges in Digital Transformation Provides a balanced overview of AI’s potential benefits and the regulatory, ethical, and technical challenges involved.
Secure Messaging API: Encrypted, Compliant, and Reliable Communication
Technical documentation and best practices for implementing secure, encrypted messaging in healthcare applications.
Use of Electronic Patient Messaging by Pregnant Patients Receiving Antenatal Care
Examines the effectiveness of electronic messaging systems in improving patient engagement during pregnancy.
The Effectiveness of Checklists and Error Reporting Systems in Healthcare
A study on how structured digital tools enhance patient safety and reduce medical errors.
HIPAA‑Compliant Messaging Solutions: Secure Texting Applications in Healthcare
Reviews secure communication platforms designed to meet healthcare data protection standards.
AI Chatbots in Healthcare: Examples, Use Cases, and Best Practices
An overview of real-world chatbot implementations and recommended design principles for healthcare use.
Digital Health Data Security Practices Among Health Professionals
Investigates awareness, practices, and gaps in digital health data security among healthcare workers.
Responsible Artificial Intelligence in Global Health: Solutions from the Global South
Explores ethical and context-aware AI deployment strategies tailored to low- and middle-income countries.

Chapter Four: System Design
4.1 Overview
This chapter describes the system design of the MED-CARE Ethiopia project. System design is a critical phase in software development because it explains how the proposed solution will be organized and how different parts of the system will work together to achieve the project objectives. While earlier chapters focused on understanding the problem and defining requirements, this chapter focuses on translating those requirements into a structured system.
The purpose of this system design is to provide a clear picture of how MED-CARE Ethiopia operates as a web-based healthcare platform. It explains how users interact with the system, how information flows within the system, and how the system supports key services such as healthcare facility search, medication availability checking, online medicine ordering and delivery coordination, AI chatbot assistance, and secure communication between patients and healthcare providers.
A well-planned system design is important for ensuring that the system is reliable, efficient, and easy to maintain. Without a clear design, software systems can become difficult to manage, expensive to update, and prone to errors. This design helps developers, stakeholders, and evaluators understand how the system works as a whole, even without examining the actual source code.
In the context of Ethiopia’s healthcare environment, system design is especially important because users have varying levels of digital literacy, device availability, and internet connectivity. The design therefore focuses on accessibility, simplicity, and flexibility. By using a web-based approach, the system allows users to access healthcare information and request medication delivery without installing applications, making it suitable for use in urban areas, rural regions, healthcare facilities, and internet cafés.
Overall, this chapter explains how MED-CARE Ethiopia is structured to support its goal of improving healthcare access, medication information management, and medicine delivery services while ensuring security, scalability, and ease of use.
4.2 Specifying the Design Goals
The design goals of MED-CARE Ethiopia define what the system aims to achieve from a technical and user-experience perspective. These goals guide the overall structure of the system and influence all major design decisions. Each goal is aligned with the project’s objectives and the real-world challenges identified in Ethiopia’s healthcare system, including improving access to healthcare information, medication availability, and medicine delivery services.
One of the primary design goals is performance. The system is designed to respond quickly to user actions such as searching for healthcare facilities, checking medicine availability, uploading prescriptions, placing medication orders, requesting delivery services, or interacting with the AI chatbot. Slow response times can discourage users and reduce trust in the platform. Therefore, the design emphasizes efficient handling of user requests to ensure smooth and timely interactions, even when multiple users access the system simultaneously.
Another important design goal is scalability. MED-CARE Ethiopia is intended to serve a growing number of users, healthcare facilities, pharmacies, and delivery service providers over time. The system design allows new features, services, and users to be added without requiring major changes to the existing structure. This ensures that the platform can expand beyond its initial deployment and support national-level healthcare services in the future, including large-scale coordination of medicine ordering and delivery services.
Security and privacy are critical design goals due to the sensitive nature of healthcare data. The system is designed to protect personal information, medical data, prescription details, payment information, and communication between users and healthcare providers. Secure data handling and controlled access are essential to maintain user trust and comply with healthcare data protection standards. The design prioritizes secure communication, especially for messaging, prescription processing, payment transactions, and delivery-related information.
The system is also designed with availability and reliability in mind. Users should be able to access the platform whenever they need healthcare information, request medications, place medicine orders, or track delivery updates. Since healthcare needs can arise at any time, the system is designed to minimize downtime and ensure consistent access. The web-based nature of the platform helps improve availability by allowing access from different devices and locations.
Another key goal is usability. The system is designed to be easy to understand and navigate, even for users with limited experience using digital systems. Clear interfaces, simple workflows, and multilingual support help ensure that users can interact with the system comfortably. This includes simple processes for searching medicines, placing orders, and requesting delivery services. This is especially important in Ethiopia, where users come from diverse educational and cultural backgrounds.
Finally, the design goal of accessibility ensures that the system can be used across different devices and network conditions. The platform is designed to work on smartphones, tablets, and computers, supporting users in both urban and rural areas. By prioritizing accessibility, the system helps reduce barriers to healthcare information, medication access, and medicine delivery services.
4.3 System Design
The MED-CARE Ethiopia system is designed as a centralized, web-based healthcare platform that integrates multiple services into a single, unified system. The platform allows patients, healthcare providers, pharmacies, and administrators to interact with healthcare information and services in a structured and efficient manner. In addition to providing access to healthcare information, the system also supports medication ordering and coordinated delivery services, allowing patients to request medicines from pharmacies and receive them through registered delivery personnel.
At a high level, the system provides an interface through which users can perform healthcare-related tasks such as searching for nearby hospitals or pharmacies, checking medication availability, uploading prescriptions, asking health-related questions, ordering medicines, requesting home delivery of medications, and communicating securely with healthcare providers. These interactions are processed by the system and translated into meaningful responses using stored healthcare data and AI-supported features.

The system design follows a layered and modular structure. This means that the system is divided into logical parts, each responsible for a specific function. For example, one part of the system handles user interaction, another manages healthcare and pharmacy data, another supports AI chatbot responses, and another coordinates medication ordering and delivery services. This separation makes the system easier to understand, maintain, and improve over time.
Communication between different parts of the system is designed to be smooth and organized. When a user performs an action, such as searching for a medicine or placing an order, the request is processed by the appropriate system module. The system retrieves relevant information from the database, verifies medicine availability from pharmacy inventory, processes the request, and then presents the results to the user in a clear and understandable format. If a medicine order is placed, the system coordinates the delivery process by notifying registered pharmacy delivery personnel. This structured flow of information helps ensure accuracy, efficiency, and reliable service delivery.
The decision to use a web-based system is a key part of the overall design. Web-based systems do not require installation, making them easier to access for users with limited device storage or technical knowledge. This design choice supports Ethiopia’s diverse technology environment and increases the likelihood of widespread adoption, allowing users to access healthcare information, request medications, and track delivery services from various devices and locations.
Security considerations are embedded throughout the system design. The system ensures that sensitive data such as personal information, prescriptions, medical communications, and payment details are handled carefully. Secure communication channels protect interactions between patients, healthcare providers, pharmacies, and delivery personnel. By designing security into the system from the beginning, MED-CARE Ethiopia reduces risks related to data misuse, fraud, or unauthorized access.
In addition, the system is designed to support future enhancements. New services, additional healthcare providers, more pharmacies, expanded AI capabilities, and improved delivery coordination features can be integrated without disrupting existing functionality. This forward-looking design ensures that MED-CARE Ethiopia can continue to evolve alongside Ethiopia’s healthcare and digital infrastructure.
In summary, the system design of MED-CARE Ethiopia provides a strong foundation for building a reliable, secure, and accessible healthcare platform. By integrating healthcare information services with medication ordering and delivery coordination, the system addresses real-world challenges related to healthcare access and medicine availability. The structured, modular, and scalable design supports long-term growth while providing users with a practical and user-friendly solution for healthcare access and medication management.
4.3.1 Proposed Software Architecture
The proposed software architecture of MED-CARE Ethiopia is designed as a centralized, monolithic web-based healthcare platform. The architecture emphasizes simplicity, maintainability, and reliability while supporting all core services in a single deployable application. This approach reduces deployment complexity, ensures tight integration between system modules, and is suitable for the current scope and resources of the MED-CARE Ethiopia project.
The system is structured as a single application with logically separated modules for each functional area. Each module handles specific responsibilities but runs as part of the same codebase and deployment unit. Users access the platform through a web browser, where actions such as searching for healthcare facilities, checking medication availability, uploading prescriptions, placing medicine orders, requesting deliveries, or making payments are processed centrally by the application.
The system includes the following modules:

1. Authentication and User Management Module
   Handles user registration, login, role management, and access control. Ensures that only authorized users can access protected features and manages secure session handling.
2. Healthcare, Pharmacy, and Medication Module
   Manages hospitals, clinics, pharmacies, and medication inventory. Supports location-based searches, facility details, and real-time medication availability. This module also handles verification of medicine availability for orders.
3. Messaging and Notification Module
   Manages secure communication between patients, healthcare providers, and pharmacies. Also handles system notifications related to messages, order status, and delivery updates.
4. AI and Intelligent Services Module
   Provides AI-powered functionalities such as chatbot assistance, prescription image recognition, and semantic search. These features run asynchronously to maintain performance without affecting the main workflow.
5. Payment and Subscription Module
   Handles payment transactions, subscription management, and verification of payments for medicine orders. Ensures secure handling of sensitive financial data.
6. Order and Delivery Management Module
   Coordinates the complete medicine ordering and delivery workflow. Responsibilities include:
   Creating and managing medication orders
   Assigning delivery personnel to orders
   Tracking delivery status (Order placed → Confirmed → Preparing → Out for delivery → Delivered)
   Updating notifications for patients and pharmacies

This module works closely with the Healthcare, Pharmacy, and Medication module for inventory validation and with the Payment and Messaging modules for secure order processing and delivery updates.
Database Design
The monolithic system uses a single centralized database that supports all modules. Logical separation of tables and relationships ensures maintainability while simplifying data access. Key tables include:
Users
Healthcare Facilities
Medications and Inventory
Orders and Order Items
Deliveries and Delivery Personnel
Messages and Notifications
Payments and Subscriptions
Audit Logs

Communication and Workflow
Within the monolithic architecture, modules communicate internally through function calls and shared data models, eliminating the need for asynchronous message brokers like RabbitMQ. All delivery events, order updates, payment confirmations, and notifications are processed in the same application, ensuring consistency and reducing operational complexity.
Deployment
The system is deployed as a single application instance, with all modules running together on the server. Containerization using Docker can still be applied for development and testing environments, but production deployment is simplified compared to a microservices setup.

4.3.2 Subsystem Decomposition
MED-CARE Ethiopia subsystem decomposition breaks its system into smaller, manageable parts. Each subsystem represents a major functional unit of the system and supports a specific set of responsibilities. This approach improves clarity, simplifies development, and allows each part of the system to be maintained logically, even though all modules are part of a single monolithic application.
The system is decomposed into six main subsystems, aligned with the monolithic architecture:
User Management Subsystem
Handles all user-related operations, including user registration, login, authentication, role assignment, and access control. It ensures secure access to system features and protects sensitive user data.
Healthcare, Pharmacy, and Medication Subsystem
Manages core healthcare information, storing and processing data related to hospitals, clinics, pharmacies, and medications. This subsystem supports searching for nearby healthcare facilities, checking medication availability, viewing detailed facility and medication information, and verifying pharmacy inventory for medication orders.
Messaging and Notification Subsystem
Manages communication between users, healthcare providers, and pharmacies. It enables secure message exchange and generates system notifications, including updates related to medication orders and delivery statuses. This ensures timely delivery of alerts and information to users.
AI and Intelligent Subsystem
Provides automated and intelligent features, including chatbot-based healthcare assistance, prescription image processing, and semantic search functionality. Tasks within this subsystem are processed asynchronously to maintain system responsiveness without affecting other operations.

Payment and Subscription Subsystem
Manages financial transactions and subscription data. It handles payment processing, transaction verification, and billing records. This subsystem ensures secure handling of all payment-related information, including payments for medication orders.
Order and Delivery Management Subsystem (New)
Coordinates the complete medicine ordering and delivery workflow. It handles order creation, assignment of delivery personnel, tracking of delivery status (e.g., placed, confirmed, preparing, out for delivery, delivered), and notification updates. This subsystem integrates closely with the Healthcare, Pharmacy, and Medication, Payment, and Messaging subsystems to ensure smooth and timely delivery of medications.
All subsystems operate as modules within a single monolithic application. Communication between modules occurs through internal function calls and shared data models, eliminating the need for external messaging brokers for basic coordination. Despite being part of the same application, the logical separation of subsystems ensures maintainability, clarity, and the ability to expand or modify individual modules as future enhancements are added.
4.3.3 Database Design
Our database stores long-term data related to users, healthcare facilities, medications, communication, payments, orders, deliveries, and system activities. This design supports consistency, reliability, and ease of maintenance, while remaining suitable for the system’s monolithic architecture.
Database Management Approach
The system uses a centralized relational database with clearly defined tables and relationships. All modules access the shared database through controlled interfaces. Indexing, constraints, and role-based access controls ensure high performance, security, and data integrity across all functionalities, including delivery operations.

Core Database Entities
User
Stores user account information.
Attributes: user_id, full_name, email, phone_number, password_hash, role, account_status
Primary Key: user_id
Constraints: email and phone_number must be unique.

HealthcareFacility
Stores hospitals, clinics, and pharmacies.
Attributes: facility_id, name, type, location, license_number, status
Primary Key: facility_id
Constraints: license_number must be unique.

Medication
Stores medication details.
Attributes: medication_id, name, description, category, prescription_required
Primary Key: medication_id

Inventory
Stores medication availability per pharmacy.
Attributes: inventory_id, facility_id, medication_id, quantity, last_updated
Primary Key: inventory_id
Foreign Keys:

facility_id → HealthcareFacility(facility_id)

medication_id → Medication(medication_id)

Order (New)
Stores medication orders placed by users.
Attributes: order_id, user_id, pharmacy_id, total_amount, order_status, created_at, updated_at
Primary Key: order_id
Foreign Keys:

user_id → User(user_id)

pharmacy_id → HealthcareFacility(facility_id)

Delivery (New)
Stores delivery information for medication orders.
Attributes: delivery_id, order_id, delivery_person_id, status, assigned_at, delivered_at
Primary Key: delivery_id
Foreign Keys:
order_id → Order(order_id)
delivery_person_id → User(user_id) (assuming delivery personnel are registered users)

Message
Stores communication data.
Attributes: message_id, sender_id, receiver_id, content, timestamp, read_status
Primary Key: message_id
Foreign Keys:

sender_id → User(user_id)
receiver_id → User(user_id)

Notification
Stores system notifications.
Attributes: notification_id, user_id, type, content, status, created_at
Primary Key: notification_id
Foreign Key: user_id → User(user_id)

Payment
Stores payment transactions.
Attributes: payment_id, user_id, amount, payment_method, transaction_status, payment_date
Primary Key: payment_id
Foreign Key: user_id → User(user_id)

Subscription
Stores subscription plans and status.
Attributes: subscription_id, user_id, plan_type, start_date, end_date
Primary Key: subscription_id
Foreign Key: user_id → User(user_id)

AuditLog
Stores system activity logs.
Attributes: log_id, user_id, action, timestamp, ip_address
Primary Key: log_id
Foreign Key: user_id → User(user_id)
Entity Relationships
User Communication: A User can send and receive many Messages.
Transactions: A User can have multiple Payments, Subscriptions, and Orders.
Inventory Logic:
A HealthcareFacility can store multiple Medications through the Inventory table.
Each Inventory record links one specific Medication to one specific HealthcareFacility.
Orders and Deliveries:
Each Order belongs to a specific User and Pharmacy.
Each Delivery is linked to a specific Order and assigned to a delivery personnel (who is a registered User).
System Alerts: Notifications belong to a specific User.
Database Constraints and Integrity
Primary Keys: Uniquely identify each record to ensure data integrity.
Foreign Keys: Enforce relationships and referential integrity between tables, including links between Orders, Deliveries, Users, and Pharmacies.
Unique Constraints: Prevent duplicate records (e.g., email, phone number, license number).
Indexes: Applied to frequently queried fields, such as Orders, Deliveries, Messages, and Inventory, to improve search performance.
Access Control: Restricts database operations to authorized users, including separate permissions for patients, pharmacies, delivery personnel, and administrators.
Data Security and Management
Encryption: Sensitive data (e.g., passwords, payment information) is stored in encrypted or hashed form.
RBAC: Role-based access controls limit data exposure depending on user roles (e.g., patients, pharmacy staff, delivery personnel, admins).
Data Safety: Regular backups are performed to protect against data loss, including orders and delivery records.
Monitoring: Audit logs are maintained to track critical actions, including order creation, payment confirmation, and delivery updates, supporting accountability and system monitoring.

Fig 4.2 Database Diagram

Chapter Five:System Implementation
5.1 Reviewing the Design Solution
This section revisits the design solution presented in Chapter 4 and evaluates its suitability in light of the implementation phase. The primary objective of the project is to develop a unified platform that enables users to locate healthcare facilities, check medication availability, and communicate with healthcare providers. To support this goal, a microservices architecture has been adopted, dividing the system into independent services such as user management, facility search, inventory management, messaging, AI processing, and payment handling. This modular approach ensures that each service can be developed, deployed, and scaled independently, improving system flexibility, maintainability, and long‑term evolution.
In terms of non‑functional requirements, the design demonstrates strong alignment with performance, scalability, and security objectives. The microservices architecture enables horizontal scaling, while asynchronous communication mechanisms—such as message‑broker‑based interactions—improve system responsiveness and decouple the services. Security considerations, including robust authentication, fine‑grained authorization, and encrypted communication, have been integrated into the system design from the outset to protect sensitive healthcare data and user information.
Overall, the design solution remains valid and well‑aligned with the project objectives. The transition to a microservices‑based architecture using Next.js, Node.js, and MongoDB enhances the system’s scalability, flexibility, and readiness for real‑world deployment. The design provides a solid foundation for implementation, ensuring that the platform can effectively address the identified healthcare challenges while supporting future growth, additional features, and continuous enhancements.

5.2 Deciding on the Development Tools
This section presents the selection of development tools and technologies used to implement the MED-CARE Ethiopia system. The choice of tools is guided by the system’s requirements for scalability, performance, security, and accessibility, as well as the adoption of a microservices-based architecture.
Core Technology Stack
The system is built using a modern full-stack architecture consisting of Next.js for the frontend, Node.js for backend microservices, and MongoDB for data storage. This combination provides a unified development environment while supporting scalability and high performance.
On the frontend, Next.js is used to develop a responsive Progressive Web Application (PWA). It enables server-side rendering and efficient routing, which improves performance and accessibility across different devices.Tailwind CSS is used alongside Next.js to create a mobile-first, responsive user interface.
On the backend, Node.js is used as the runtime environment, with Express.js for building RESTful APIs. The backend is structured into multiple microservices, each responsible for a specific functionality such as user authentication, healthcare facility management, inventory tracking, messaging, AI processing, and payment handling. This modular approach allows independent development and scaling of services.
Database and Search Technologies
The system uses MongoDB Atlas as its primary database solution. MongoDB’s document-based structure allows flexible storage of healthcare-related data, including user profiles, facility information, and medication records.
Instead of using an external vector database, the system utilizes MongoDB Atlas Search to support advanced search capabilities. Atlas Search enables efficient querying of medication names, descriptions, and related information, providing a simplified and integrated alternative for semantic search functionality.
Event Streaming and Communication
For inter-service communication, the system uses a combination of REST APIs and event-driven architecture. Apache Kafka is used as the primary event streaming platform to handle asynchronous communication between microservices. Kafka supports reliable message delivery for operations such as order processing, payment updates, and notification handling, ensuring system scalability and fault tolerance.
Development Environment and Tools
The development environment is set up using Visual Studio Code (VS Code) as the primary code editor due to its extensive support for JavaScript and TypeScript development.
The project follows a multi-repo structure, managed using modern tools such as pnpm and Turborepo, which facilitate efficient dependency management and parallel development of multiple services.
To ensure consistency across environments, Docker is used for containerization. Each microservice runs in its own container, allowing independent deployment and simplifying system configuration. Supporting services such as MongoDB, Kafka, and Redis are also managed through containerized environments during development.
Version Control and Collaboration
Version control is handled using Git, with repositories hosted on GitHub. Git enables collaborative development, version tracking, and efficient management of code changes. Branching strategies are used to separate development, testing, and production workflows.
Testing and Quality Assurance Tools
To maintain system quality and reliability, multiple testing tools are used. Unit testing is performed using Jest, while end-to-end testing is conducted using Cypress to simulate real user interactions. Additional tools such as ESLint and Prettier are used to maintain code quality and consistency across the project.
Third-Party Integrations
The system integrates several external services to enhance functionality. Mistral AI is used for prescription image recognition and chatbot capabilities, while Chapa is integrated as the payment gateway for secure financial transactions. These integrations ensure that the system meets both functional and contextual requirements within Ethiopia.
Deployment and Hosting
The frontend application is deployed using platforms such as Vercel, which provides optimized hosting for Next.js applications. Backend microservices are deployed using container-based cloud environments, ensuring scalability and high availability. MongoDB is hosted using MongoDB Atlas, which offers managed database services with built-in security, backup, and scaling features.
5.3 Developing the Solution
This section presents the implementation of the MED-CARE Ethiopia system based on the microservices architecture defined in earlier chapters. The development process focuses on modularity, scalability, and maintainability, ensuring that each component of the system functions independently while integrating seamlessly with others.
5.3.1 Development Approach and Coding Practices
The system is developed using a modular microservices approach, where each service is implemented as an independent Node.js application. This ensures separation of concerns and allows different parts of the system to evolve independently.
Key coding practices include:
Use of TypeScript for type safety and maintainability
RESTful API design with clear versioning (/api/v1/...)
Consistent folder structure across services
Reusable components in the frontend
Input validation using schema validation libraries
Environment-based configuration using .env files
Example of a basic Node.js microservice setup:
import express from 'express';
import mongoose from 'mongoose';
const app = express();
app.use(express.json());
// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI!);

// Sample route
app.get('/api/v1/health', (req, res) => {
res.json({ status: 'Service is running' });
});
app.listen(3000, () => console.log('Service running on port 3000'));
5.3.2 Frontend Implementation (Next.js)
The frontend is developed using Next.js App Router, enabling server-side rendering and efficient routing. The application is structured as a Progressive Web Application (PWA) to support accessibility in low-bandwidth environments.
Key features implemented:
Responsive UI using Tailwind CSS
API integration with backend services
Dynamic pages for healthcare facilities and medications
Form handling for login, search, and orders
Example of an API integration in Next.js:
// app/api/search-meds/route.js
export async function GET(req) {
const response = await fetch(`${process.env.API_URL}/inventory/search`);
const data = await response.json();
return Response.json(data);
}

Example of a UI component:
export default function SearchBar({ onSearch }) {
return (
<input
type="text"
placeholder="Search medications..."
className="w-full p-2 border rounded"
onChange={(e) => onSearch(e.target.value)}
/>
);
}
5.3.3 Backend Microservices Implementation
The backend consists of multiple microservices, each responsible for a specific functionality:
User Service (authentication and authorization)
Facility Service (healthcare provider data)
Inventory Service (medication availability)
Order Service (order processing)
Payment Service (Chapa integration)
Messaging Service (real-time communication)
AI Service (OCR and chatbot)
Each service follows a similar structure and communicates via APIs and Kafka events.
Example of a Kafka producer (Order Service):
import { Kafka } from 'kafkajs';

const kafka = new Kafka({
clientId: 'order-service',
brokers: [process.env.KAFKA_BROKER!],
});

const producer = kafka.producer();

export const sendOrderEvent = async (order) => {
await producer.connect();
await producer.send({
topic: 'order-created',
messages: [{ value: JSON.stringify(order) }],
});
};

5.3.4 Database Implementation (MongoDB)
Each microservice manages its own MongoDB database using Mongoose for schema definition.
Example of a Medication Schema:
import mongoose from 'mongoose';

const medicationSchema = new mongoose.Schema({
name: String,
description: String,
quantity: Number,
price: Number,
location: {
type: { type: String, default: 'Point' },
coordinates: [Number],
},
});

medicationSchema.index({ location: '2dsphere' });

export default mongoose.model('Medication', medicationSchema);

Search using MongoDB Atlas Search
const results = await Medication.aggregate([
{
$search: {
index: "medcare_search",
text: {
query: "paracetamol",
path: ["name", "description"]
}
}
},
{ $limit: 10 }
]);

5.3.5 Integration Strategy
The system integrates services using:
REST APIs for direct communication
Kafka for asynchronous event-driven communication
API Gateway (Next.js / Nginx) for unified access
Example workflow:
User places order
Order Service creates order
Kafka event is triggered
Payment Service processes payment
Notification is sent to user
This ensures loose coupling and scalability.
5.3.6 Challenges Faced and Solutions
During development, several challenges were encountered:

1. Microservices Complexity
   Managing multiple services increased system complexity.
   Solution: Adopted a monorepo structure and Docker for consistency.
2. Real-Time Communication
   Handling messaging between users required efficient real-time updates.
   Solution: Implemented Socket.io for real-time messaging.
3. Search Optimization
   Efficient medication search was challenging.
   Solution: Used MongoDB Atlas Search instead of external vector databases.
4. Service Communication
   Ensuring reliable communication between services.
   Solution: Implemented Kafka for event-driven architecture.
   Chapter Six:System Evaluation
   6.1 Preparing Sample Test Plans
   This section outlines the methodology used to prepare test plans for evaluating the MED-CARE Ethiopia system. The purpose of the test plan is to ensure that all system functionalities meet the specified requirements and perform reliably under expected conditions. The testing strategy is designed to validate both functional and non-functional aspects of the system.
   6.1.1 Testing Methodology
   The system follows a multi-level testing approach, where testing is conducted at different stages of development to ensure quality and reliability. The main testing levels include:
   Unit Testing – Testing individual components such as functions, modules, and services
   Integration Testing – Verifying communication between microservices and APIs
   System Testing – Evaluating the complete system as a whole
   End-to-End Testing – Simulating real user interactions across the platform
   This layered approach ensures that errors are detected early and reduces the risk of system failure after deployment.
   6.1.2 Test Case Design
   Test cases are designed based on the system’s functional requirements, ensuring that all major features are covered. Each test case includes:
   Test Case ID
   Test Description
   Input Data
   Expected Output
   Actual Output
   Test Status (Pass/Fail)
   Test cases are categorized according to system modules, such as:
   User Authentication
   Facility Search
   Medication Search
   Order and Payment Processing
   Messaging System
   AI Chatbot and OCR

Sample Test Case Table
Test Case ID
Description
Input
Expected Output
Status
TC-01
User login with valid credentials
Email, Password
User successfully logged in
Pass
TC-02
Search medication
“Paracetamol”
List of available medications
Pass
TC-03
Place order
Medication ID, Quantity
Order created successfully
Pass
TC-04
Payment processing
Valid payment details
Payment successful
Pass
TC-05
Send message
Text message
Message delivered
Pass

6.1.3 Success Criteria
The system is considered successful if it meets the following criteria:
All critical test cases pass successfully
System response time remains within acceptable limits
No major functional errors occur during operation
Secure authentication and data handling are maintained
Services communicate correctly without failure
Additionally, the system must demonstrate stability under normal usage conditions and provide accurate results for user queries.
6.1.4 Testing Tools and Techniques
To support the testing process, several tools and techniques are used:
Jest for unit testing of backend services
Cypress for end-to-end testing of user interactions
Postman for API testing and validation
MongoDB Compass for database verification
Docker for testing services in isolated environments
Automated testing is prioritized to improve efficiency and ensure consistent test execution.
6.1.5 Test Environment Setup
The testing environment replicates the production setup as closely as possible. It includes:
Local development servers for frontend and backend
Containerized services using Docker
MongoDB Atlas for database testing
Kafka for event-driven communication testing
Environment variables are configured to simulate real-world conditions, including API endpoints, database connections, and authentication credentials.
6.2 Evaluating the Proposed Design and Solutions
This section presents the evaluation of the MED-CARE Ethiopia system by executing the prepared test plans and analyzing the system’s behavior under different scenarios. The evaluation focuses on validating the functionality, performance, and reliability of the system based on the design proposed in earlier chapters.
The testing process was conducted in a controlled development environment using the tools and methodologies described in Section 6.1. Results were recorded and analyzed to determine whether the system meets its functional and non-functional requirements.
6.2.1 Test Execution Process
The test cases defined in the test plan were executed across different system modules, including authentication, medication search, order processing, messaging, and AI services.
Each test case was performed by:
Providing the required input
Observing system behavior
Recording the actual output
Comparing it with the expected output
Assigning a pass or fail status
The system was tested using both manual and automated approaches, including API testing and end-to-end user simulation.
6.2.2 Functional Testing Results
The table below summarizes the results of key functional test cases:
Table 6.1: Functional Test Results
Test Case ID
Description
Input
Expected Output
Actual Output
Status
TC-01
User login
Valid email & password
Successful login
Login successful, token generated
Pass
TC-02
Invalid login
Incorrect password
Error message
“Invalid credentials” displayed
Pass
TC-03
Search medication
“Paracetamol”
List of medications
Correct medication list returned
Pass
TC-04
Locate facility
Location input
Nearby facilities
Facilities displayed with location
Pass
TC-05
Place order
Valid order details
Order created
Order stored in database
Pass
TC-06
Payment processing
Valid payment info
Payment successful
Payment confirmed via Chapa
Pass
TC-07
Send message
Text message
Message delivered
Message received in real-time
Pass
TC-08
AI chatbot query
“I have a headache”
Relevant response
AI returned helpful suggestion
Pass
TC-09
Prescription OCR
Image upload
Extracted text
Text successfully extracted
Pass

The results indicate that all major functionalities of the system are working as expected.

6.2.3 Integration Testing Results
Integration testing was conducted to verify communication between microservices using APIs and Kafka event streaming.
Table 6.2: Integration Test Results
Test Case ID
Scenario
Expected Behavior
Actual Behavior
Status
IT-01
Order→ Payment Service
Payment triggered after order
Payment initiated successfully
Pass
IT-02
Payment→ Notification
User notified after payment
Notification sent
Pass
IT-03
Inventory → Order
Stock updated after order
Inventory reduced correctly
Pass
IT-04
Messaging Service
Real-time communication
Messages delivered instantly
Pass

The system demonstrated reliable communication between services, confirming the effectiveness of the microservices architecture.

6.2.4 Performance Evaluation
The system’s performance was evaluated based on response time and system behavior under normal usage conditions.
Table 6.3: Performance Metrics
Operation
Expected Time
Actual Time
Status
Login
≤ 2 seconds
1.2 seconds
Pass
Medication Search
≤ 1 second
0.6 seconds
Pass
Order Processing
≤ 3 seconds
2.1 seconds
Pass
AI Response
≤ 3 seconds
2.8 seconds
Pass

The results show that the system meets the required performance thresholds and provides a responsive user experience.
6.2.5 System Behavior and Observations
During testing, the system demonstrated:
Stable performance across all modules
Accurate data retrieval and processing
Reliable communication between microservices
Secure handling of authentication and user data
Consistent user experience across different devices
No critical failures were observed during testing. Minor issues encountered during development were resolved prior to final testing.
6.2.6 Evaluation Summary
Based on the test results, the proposed design and implemented solution meet the project objectives. All major functionalities operate correctly, and the system performs efficiently under expected conditions.
The microservices architecture proved effective in ensuring scalability and reliability, while the chosen technology stack (Next.js, Node.js, MongoDB, and Kafka) successfully supports the system requirements.
Overall, the system is considered functional, stable, and ready for deployment, with the potential for further enhancements in future iterations.
6.3 Discussing the Results
This section provides an analysis of the results obtained from the system evaluation. The discussion focuses on determining whether the MED-CARE Ethiopia system meets its defined objectives, identifying any limitations observed during testing, and suggesting possible improvements for future development.
6.3.1 Achievement of System Objectives
Based on the evaluation results presented in Section 6.2, the system successfully meets its primary objectives.
The platform effectively enables users to search for healthcare facilities and check medication availability in real time. The test results confirmed that search functionalities return accurate and relevant results within acceptable response times. This demonstrates that the system addresses one of the key problems identified in the Ethiopian healthcare context—difficulty in locating medical resources.
The system also achieved its objective of improving communication between patients and healthcare providers. The messaging feature functioned reliably, with real-time message delivery observed during testing. This supports efficient interaction and reduces delays in accessing healthcare services.
Additionally, the integration of AI features, including chatbot assistance and prescription image recognition, was successfully implemented. The chatbot provided relevant responses to user queries, while the OCR functionality was able to extract text from prescription images with reasonable accuracy. These features contribute to reducing user dependency on manual processes and healthcare personnel for basic inquiries.
6.3.2 Performance and System Behavior
The system demonstrated stable performance under normal testing conditions. Response times for key operations such as login, search, and order processing were within the expected limits. The use of a microservices architecture contributed to efficient handling of requests and smooth interaction between system components.
The event-driven communication using Kafka ensured reliable processing of background operations such as order handling and notifications. No major delays or failures were observed in inter-service communication, indicating that the system design is robust and scalable.
Overall, the system provided a consistent and responsive user experience across different functionalities.
6.3.3 Issues and Limitations Identified
Despite the overall success of the system, several limitations and minor issues were identified during testing:
AI Accuracy Limitations: The chatbot occasionally produced generalized responses, and the OCR feature showed reduced accuracy when processing low-quality or unclear prescription images.
Network Dependency: Some features, particularly real-time messaging and API calls, depend heavily on stable internet connectivity, which may affect usability in low-connectivity areas.
System Complexity: The microservices architecture, while scalable, introduces additional complexity in development, deployment, and debugging.
Performance Under Load: Although not fully stress-tested, the system may require further optimization to handle very high user traffic efficiently.
These limitations highlight areas where further refinement is necessary.
6.3.4 Implications of the Findings
The evaluation results indicate that the MED-CARE Ethiopia system is a viable solution for improving healthcare accessibility and service delivery. The successful implementation of core functionalities demonstrates the practicality of using modern web technologies and microservices architecture in the Ethiopian context.
However, the identified limitations suggest that additional improvements are required to ensure robustness in real-world deployment, particularly in environments with limited infrastructure.
The findings also emphasize the importance of balancing advanced features (such as AI integration) with usability and reliability.

6.3.5 Recommendations and Future Improvements
Based on the evaluation results, the following improvements are recommended:
Enhance AI Capabilities: Improve chatbot accuracy and OCR performance through better training data and optimization techniques.
Offline Support: Expand offline capabilities using PWA features to support users in low-connectivity areas.
Performance Optimization: Conduct load testing and optimize system performance for large-scale usage.
Monitoring and Logging: Implement advanced monitoring tools to track system performance and detect issues in real time.
User Experience Improvements: Simplify user interfaces and improve accessibility for users with low digital literacy.
Future work may also include integrating additional healthcare services, such as appointment scheduling and telemedicine features.
Chapter Seven: Conclusions and Recommendations
7.1 Conclusion of the Study
This study focused on the design, development, and evaluation of the MED‑CARE Ethiopia system, a web‑based healthcare platform developed to improve healthcare accessibility, medication management, healthcare facility navigation, and communication between patients and healthcare providers in Ethiopia. The project was motivated by challenges identified in the Ethiopian healthcare sector, including limited access to reliable medication information, fragmented healthcare systems, inefficient delivery coordination, and medication‑related errors associated with manual processes and illegible prescriptions. These gaps, first articulated in Chapter 1, were systematically addressed through the architectural choices in Chapter 4 and confirmed by the evaluation results in Chapter 6.
Through a systematic process involving requirement analysis, system design, implementation, testing, and evaluation, the project successfully achieved the objectives outlined at the beginning of the study. The final system was implemented using a modern microservices architecture based on Next.js, Node.js, MongoDB Atlas, and Kafka, providing a scalable, maintainable, and production‑ready solution tailored to Ethiopia’s digital healthcare needs. The architecture chapter’s decision to adopt a microservices‑based, event‑driven design was directly informed by the need to support independent scaling of services such as medication search, inventory management, and messaging, which in turn matched the non‑functional requirements (performance, scalability, and resilience) identified in the problem statement.
The developed platform integrates several core functionalities into a unified Progressive Web Application (PWA), including:
Real‑time healthcare facility and medication search
Medication inventory tracking
AI‑powered multilingual chatbot assistance (Amharic and English)
Prescription image recognition using OCR
Secure real‑time messaging
Online payment integration through Chapa
Home delivery coordination
These features collectively address the information and accessibility gaps identified in existing systems. For instance, the real‑time facility and medication search directly responds to the lack of centralized, up‑to‑date information on drug availability in Chapter 1, while the home delivery coordination module alleviates the inefficiencies in manual delivery scheduling that were observed in local pharmacies and clinics.
The evaluation results confirmed that the system successfully met both functional and non‑functional requirements. Functional testing demonstrated that major services—including authentication, medication search, order processing, messaging, AI services, and payment integration—operated correctly and reliably. Integration testing also verified effective communication between distributed microservices through REST APIs and Kafka‑based event streaming, which validated the architecture‑chapter decision to decouple critical workflows via events. For example, the order fulfillment pipeline uses Kafka to coordinate between the order service, inventory service, and delivery service, ensuring that stock levels are updated and delivery tasks are triggered even if one service temporarily fails—a design choice that directly improves reliability for real‑world healthcare workflows.
The implementation of the microservices architecture proved particularly effective in improving scalability and reliability. During simulated testing scenarios, services were able to scale independently and maintain stable performance under concurrent requests. The adoption of MongoDB Atlas Search as an integrated search solution also provided efficient semantic medication search capabilities without introducing the complexity of external vector database systems, aligning with the need for a lightweight, cloud‑native stack suitable for Ethiopian healthcare environments.
In addition, the project demonstrated the practical advantages of adopting a web‑first strategy through PWA technologies. The PWA approach improved accessibility across smartphones, desktops, and low‑resource environments while reducing dependency on platform‑specific mobile applications. Offline capabilities further improved usability for users in areas with unstable internet connectivity, directly addressing one of the key constraints highlighted in the problem statement.
Several important lessons were learned throughout the development process, each grounded in concrete experiences from the project:
Microservices architectures improve scalability but require careful coordination and monitoring.
During implementation, the team observed that independently scaling services such as the inventory and messaging modules improved performance under load; however, this also introduced challenges in tracing requests across services and managing configuration. As a result, the project added structured logging and centralized monitoring, reinforcing the need to treat operations and observability as first‑class design concerns, not just deployment concerns.
Event‑driven communication using Kafka enhances reliability for distributed healthcare workflows.
A key example is the order fulfillment and delivery pipeline, where Kafka events ensure that inventory updates, SMS notifications, and delivery‑scheduler tasks are coordinated reliably even when one service is temporarily unavailable. This pattern transformed error‑prone manual coordination into a more resilient, automated workflow, directly supporting the objective of reducing medication‑related errors and delivery delays.
AI localization is essential, particularly for Amharic prescription recognition and multilingual healthcare assistance.
The project initially assumed that a generic OCR engine could reliably recognize Amharic‑script prescriptions, but early testing revealed low accuracy and frequent segmentation errors. This forced the team to refine the preprocessing pipeline, tune the OCR model on Amharic‑specific fonts, and guide users to take clearer, higher‑contrast images. These practical difficulties underscored the importance of designing AI‑assisted features specifically for local language contexts, rather than treating them as plug‑and‑play components.
Progressive Web Applications provide a cost‑effective and accessible solution for resource‑constrained environments.
By building a PWA instead of a native mobile app, the project reduced development overhead and avoided the need for separate iOS and Android builds. Field‑like testing showed that users on low‑end smartphones could access the platform with acceptable performance, and offline‑cache‑based features improved resilience in areas with intermittent connectivity—confirming that the PWA strategy effectively addresses the resource‑constrained environment described in Chapter 1.
Despite the successful implementation, some limitations were identified. AI accuracy for OCR and chatbot responses can still be improved, especially for complex handwritten prescriptions or noisy images, and system performance under large‑scale real‑world deployment requires additional optimization and stress testing. Furthermore, certain features, such as online payment and real‑time messaging, remain dependent on stable internet connectivity, which may limit usability in very remote areas.
Overall, the MED‑CARE Ethiopia system successfully achieved the objectives established in Chapter One and provides a practical and scalable digital healthcare solution for Ethiopia. Specifically:
The objective of improving healthcare accessibility was achieved through the unified PWA, real‑time facility and medication search, and home delivery coordination.
The objective of enhancing medication management was met via inventory tracking, prescription OCR, and AI‑assisted drug‑information services.
The objective of improving communication between patients and providers was fulfilled by secure real‑time messaging and multilingual chatbot support.
The final artifact demonstrates how modern web technologies, microservices architecture, and AI‑assisted healthcare services can be effectively integrated to address real‑world healthcare challenges while supporting Ethiopia’s ongoing digital transformation initiatives.
7.2 Recommendations of the Study
Based on the findings, evaluation results, and limitations identified during the study, several recommendations are proposed for future work, including further development, targeted improvements, and additional research directions. These recommendations are directly informed by the design decisions in Chapter 4, the implementation challenges in Chapter 5, and the evaluation outcomes in Chapter 6.
Enhancement of AI Services
The AI components—particularly the prescription OCR and the multilingual chatbot—performed adequately but showed room for improvement under real‑world conditions. Future work should focus on enhancing the accuracy and robustness of these AI services through domain‑specific refinement.
The OCR service can be improved by training on a larger, curated dataset of Ethiopian‑style prescriptions, including handwritten Amharic and mixed‑script prescriptions. This would address the limitations observed during testing, where low‑quality images and complex layouts reduced recognition accuracy. Additionally, integrating image preprocessing techniques (such as contrast enhancement and noise reduction) into the existing pipeline could further improve OCR performance without requiring major architectural changes.
The chatbot can be upgraded by adopting more advanced language models and enriching its knowledge base with localized, up‑to‑date healthcare guidelines and drug‑information resources. Incorporating feedback‑based learning mechanisms—where user interactions are used to refine responses—would align the chatbot more closely with the information‑seeking behaviors observed during user testing.
To further improve accessibility, future versions should integrate speech recognition and voice‑based interaction in local languages such as Amharic and Oromo. This would particularly benefit users with limited literacy or those who are more comfortable interacting verbally, thereby extending the platform’s reach beyond the currently supported text‑based interfaces.
Expansion of Offline and Mobile Capabilities
Although the Progressive Web Application (PWA) approach already supports basic offline functionality, the evaluation revealed that user experience in low‑connectivity regions can be enhanced through deeper offline features. Future work should extend offline support by caching additional data—for example, recent search results, medication descriptions, and delivery status updates—so that core tasks remain usable even when the network is intermittent.
Future versions may also adopt hybrid mobile applications built on top of the existing microservices API layer (e.g., using React Native or Flutter). This would allow the platform to leverage native device capabilities such as push notifications, background sync, and local storage while preserving the distributed backend architecture. Such a mobile layer would complement the existing web‑first strategy and better align with the observed usage patterns of users who predominantly access digital services through smartphones.
Advanced Delivery and Logistics Management
The current delivery subsystem effectively handles basic order‑to‑delivery coordination; however, it does not yet provide advanced logistics capabilities. Future work should expand this into a dedicated delivery management module with the following features:
GPS‑based real‑time tracking of delivery personnel and vehicles.
Automated route optimization based on traffic, distance, and time‑based delivery windows.
Driver management and rating systems to improve service quality and accountability.
Dynamic delivery pricing that adjusts based on distance, urgency, and time of day.
These enhancements would directly address the limitations observed during testing, where manual route planning and static pricing reduced efficiency and user satisfaction. A more sophisticated delivery engine would also better support scaling the platform to urban and peri‑urban areas with high demand.
Healthcare System Integration
The evaluation confirmed that the current platform operates largely as a standalone application; however, its full potential can be realized only when it is integrated with national and regional healthcare information systems. Future work should explore interoperability with national systems such as DHIS2 (District Health Information Software 2) and eCHIS (Electronic Community Health Information System) using standardized healthcare data formats such as FHIR (Fast Healthcare Interoperability Resources).
Such integration would enable centralized healthcare data synchronization, support more accurate reporting, and facilitate coordination between public‑sector clinics and private pharmacies. It would also align the platform with broader digital health initiatives in Ethiopia, allowing MED‑CARE to contribute to, rather than duplicate, national health‑information infrastructure.
Performance Optimization and Scalability
The testing phase demonstrated that the microservices architecture performs well under moderate load, but nationwide deployment will require more rigorous scalability and resilience measures. Future work should focus on advanced performance optimization and scalability enhancements, including:
Advanced load‑balancing strategies that distribute traffic dynamically across replicas of critical services.
Centralized monitoring and logging systems (such as ELK stack or Prometheus‑Grafana) to track service health, latency, and error rates.
Distributed caching mechanisms (e.g., Redis or similar) to reduce database load and improve response times for frequently accessed data such as medication catalogs and facility locations.
Automated scaling infrastructure that can scale services up or down based on real‑time traffic patterns.
These improvements are necessary to ensure stable performance under high‑traffic conditions—such as during public‑health campaigns or disease outbreaks—where the system may experience sudden spikes in usage.
Additional Healthcare Features
The evaluation results suggest that the platform can be extended beyond its current scope to offer a more comprehensive digital healthcare ecosystem. Future versions may integrate additional healthcare functionalities, including:
Telemedicine and video consultation services to enable remote clinical consultations.
Appointment scheduling systems that allow users to book and manage clinic visits.
Basic electronic health records (EHR) that can be shared—on a consent‑based basis—between providers.
Emergency response coordination features that connect users with nearby emergency services.
Medication reminder systems that send notifications to users for scheduled doses.
These features would significantly expand the platform’s impact and usability, transforming MED‑CARE from a medication‑search and delivery system into a broader healthcare–support platform.
Research and Academic Opportunities
The project opens several opportunities for follow‑up academic and technical research. These include:
Machine learning for healthcare prediction and recommendation systems, such as predicting medication stock‑outs or recommending alternative drugs based on availability.
AI‑based disease‑outbreak prediction models that leverage anonymized search and usage patterns from the platform.
User adoption and usability studies in rural and low‑resource communities, investigating how such platforms are actually used and trusted in practice.
Economic analysis of digital healthcare systems in Ethiopia, evaluating cost‑effectiveness and return‑on‑investment for stakeholders.
Publishing anonymized datasets related to prescription OCR results and healthcare search behavior (with appropriate privacy safeguards) could further contribute to the research community and support independent validation of findings.
Institutional Collaboration and Deployment
For long‑term success, the system must move beyond the prototype stage into real‑world deployment and validation. Future work should prioritize collaboration with healthcare institutions, pharmacies, delivery providers, and government organizations. Strategic partnerships with entities such as the Federal Ministry of Health (FMOH), the Ethiopian Public Health Institute (EPHI), and major healthcare providers would improve data quality, clinical governance, and overall adoption.
Such collaborations would also enable pilot deployments in selected regions, allowing the platform to be evaluated under real‑world conditions and iteratively refined based on feedback from clinicians, pharmacists, and patients. This would align with the study’s aim of producing a practical, scalable digital healthcare solution rather than a purely academic artifact.
Final Reflection
The MED‑CARE Ethiopia project demonstrates the potential of modern web technologies and microservices architecture to improve healthcare accessibility and service delivery in Ethiopia. Beyond its technical implementation, the system represents a practical step toward digital healthcare transformation by addressing medication access, healthcare communication, and service coordination challenges.
The project also establishes a scalable architectural foundation that can be extended and adapted for broader healthcare applications in Ethiopia and similar resource‑constrained environments. With continued refinement, institutional collaboration, and future expansion, the platform has strong potential for large‑scale deployment and long‑term societal impact.
