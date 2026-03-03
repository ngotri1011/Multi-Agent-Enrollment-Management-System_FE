Capstone Project name: 
English: Multi-Agent Enrollment Management System with LLM Assistance
Vietnamese: Hệ thống đa tác tử hỗ trợ quản lý tuyển sinh với sự hỗ trợ của LLM
Abbreviation: SP26SE143
Proposed Solutions 
- System Administrator
    + Manage enrollment configurations, admission rules, and system parameters
    + Configure agent coordination rules and workflow policies
    + Monitor system performance, agent activities, and resource usage

- Admission Officer (Enrollment Staff)
    + Review and manage applicant records and enrollment status
    + Handle special or exceptional cases escalated by the system
    + Adjust enrollment decisions based on institutional policies
    + Export enrollment reports and decision logs

- Quality Assurance Officer
    + Review agent-generated evaluations and recommendations
    + Validate rule-based eligibility checks and document verification logic
    + Analyze system decisions to ensure consistency and correctness
    + Assist in refining enrollment rules and agent behaviors

- Applicants (Users)
    + Submit application forms and required documents
    + Receive automated notifications regarding application status
    + Obtain explanations for eligibility results or missing requirements
    + Ask enrollment-related questions through the system

- Guest Users
    + Access demo enrollment scenarios and sample reports
    + Explore system functionalities in read-only mode  
Functional requirement 
    - User authentication and role-based access control
    - Submission and management of enrollment applications and supporting documents
    - Automatic document verification, including completeness and format validation
    - Rule-based eligibility evaluation based on predefined admission criteria
    - Multi-agent coordination for
        + Application intake and data normalization
        + Document verification and requirement checking
        + Eligibility assessment and program matching
        + Applicant inquiry handling and response generation
    - LLM-assisted support for
        + Interpretation of enrollment regulations and policy documents
        + Natural language responses to applicant inquiries
        + Explanation of eligibility decisions and missing requirements
    - Automated notification and reminder generation (e.g., deadlines, missing documents)
    - Transparent tracking of application status and agent decisions
    - Generation of detailed enrollment reports and decision explanations
    - Export of enrollment data and reports in PDF or CSV format
   Non-functional requirement: 
- Support for concurrent processing of large numbers of applications
- Reliable handling of incomplete, inconsistent, or ambiguous applicant data
- Secure storage of personal data, documents, and decision logs
- Scalability to support peak enrollment periods
- Clear, consistent, and reproducible enrollment decisions
- Auditability of agent actions and decision-making processes
(*) 3.2. Main proposal content (including result and product)   
Theory and practice (document):
    -Follow a structured Software Development Life Cycle (SDLC) to design and implement the multi-agent enrollment system
    - Apply multi-agent system design principles for task decomposition and coordination
    - Apply rule-based decision mechanisms for eligibility evaluation and document validation
    - Integrate LLM-assisted reasoning and communication for document interpretation, inquiry handling, and explanation generation
    - Provide comprehensive project documentation, including:
        + System analysis and requirements specification
        + Multi-agent architecture and interaction design
        + Implementation and integration details
        + System testing and evaluation
        + Deployment guidelines and user manual
        + Source code
Products:
- Web-based enrollment management dashboard for admission staff
- Applicant portal for application submission and status tracking
- Multi-agent enrollment processing and decision support system
- Automated notification and reporting services
- Analytics dashboard for enrollment statistics and system performance
- Responsive for mobile devices.
- Articles about admissions/school events/activities
Proposed Tasks:
- Task 1: Analyze enrollment processes and define admission rules and evaluation criteria
- Task 2: Design the multi-agent architecture and agent coordination mechanisms
- Task 3: Implement document intake, verification, and data normalization agents
- Task 4: Implement rule-based eligibility evaluation and escalation mechanisms
- Task 5: Integrate LLMs for inquiry handling, policy interpretation, and explanation generation
- Task 6: Develop a web-based system for enrollment management and monitoring
- Task 7: Conduct system validation, deployment, and prepare comprehensive documentation