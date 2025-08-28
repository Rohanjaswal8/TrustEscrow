// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Escrow {
    struct Project {
        string title;
        string description;
        address client;
        address freelancer;
        uint256 budget;
        uint8 status; // 0: Created, 1: InProgress, 2: Completed, 3: Disputed, 4: Cancelled
        uint256 completedMilestones;
        uint256 totalMilestones;
        uint256 deadline;
    }

    struct Escrow {
        address buyer;
        address seller;
        address arbitrator;
        uint256 amount;
        uint8 status; // 0: Created, 1: InProgress, 2: Completed, 3: Disputed, 4: Resolved
        string ipfsHash;
    }

    mapping(uint256 => Escrow) public escrows;
    mapping(uint256 => Project) public projects;
    uint256 public escrowCount;
    uint256 public projectCount;

    event EscrowCreated(uint256 indexed escrowId, address indexed buyer, address indexed seller, uint256 amount);
    event FundsDeposited(uint256 indexed escrowId, uint256 amount);
    event FundsReleased(uint256 indexed escrowId);
    event DisputeRaised(uint256 indexed escrowId, string ipfsHash);
    event DisputeResolved(uint256 indexed escrowId, bool fundsReleased);
    event ProjectCreated(uint256 indexed projectId, address indexed client, address indexed freelancer, uint256 budget);
    event MilestoneCompleted(uint256 indexed projectId, uint256 milestoneIndex);
    event ProjectCompleted(uint256 indexed projectId);
    event ProjectDisputed(uint256 indexed projectId, string ipfsHash);
    event ProjectCancelled(uint256 indexed projectId);

    modifier onlyBuyer(uint256 escrowId) {
        require(msg.sender == escrows[escrowId].buyer, "Only buyer can perform this action");
        _;
    }
    
    modifier onlyArbitrator(uint256 escrowId) {
        require(msg.sender == escrows[escrowId].arbitrator, "Only arbitrator can perform this action");
        _;
    }
    
    modifier inStatus(uint256 escrowId, uint8 _status) {
        require(escrows[escrowId].status == _status, "Invalid escrow status");
        _;
    }
    
    function createEscrow(address _seller, address _arbitrator) public payable {
        require(msg.value > 0, "Amount must be greater than 0");
        require(_seller != address(0), "Invalid seller address");
        require(_arbitrator != address(0), "Invalid arbitrator address");
        // require(_seller != msg.sender, "Seller cannot be the buyer"); // Allow self-seller for testing
        require(_arbitrator != msg.sender && _arbitrator != _seller, "Arbitrator must be a third party");

        uint256 escrowId = escrowCount++;
        escrows[escrowId] = Escrow({
            buyer: msg.sender,
            seller: _seller,
            arbitrator: _arbitrator,
            amount: msg.value,
            status: 1, // Set to Funded (1) since funds are already provided
            ipfsHash: ""
        });

        emit EscrowCreated(escrowId, msg.sender, _seller, msg.value);
        emit FundsDeposited(escrowId, msg.value); // Emit funds deposited event
    }
    
    function depositFunds(uint256 _escrowId) public payable {
        Escrow storage escrow = escrows[_escrowId];
        require(escrow.buyer == msg.sender, "Only buyer can deposit funds");
        require(escrow.status == 1, "Escrow must be in Funded state to add more funds");
        require(msg.value > 0, "Amount must be greater than 0");

        escrow.amount += msg.value;
        emit FundsDeposited(_escrowId, msg.value);
    }
    
    function releaseFunds(uint256 _escrowId) public {
        Escrow storage escrow = escrows[_escrowId];
        require(escrow.status == 1, "Escrow must be in InProgress state");
        require(msg.sender == escrow.buyer || msg.sender == escrow.arbitrator, "Only buyer or arbitrator can release funds");

        escrow.status = 2;
        (bool success, ) = escrow.seller.call{value: escrow.amount}("");
        require(success, "Transfer failed");

        emit FundsReleased(_escrowId);
    }
    
    function raiseDispute(uint256 _escrowId, string memory _ipfsHash) public {
        Escrow storage escrow = escrows[_escrowId];
        require(escrow.status == 1, "Escrow must be in InProgress state");
        require(msg.sender == escrow.buyer || msg.sender == escrow.seller, "Only buyer or seller can raise dispute");

        escrow.status = 3;
        escrow.ipfsHash = _ipfsHash;
        emit DisputeRaised(_escrowId, _ipfsHash);
    }
    
    function resolveDispute(uint256 _escrowId, bool _releaseFunds) public {
        Escrow storage escrow = escrows[_escrowId];
        require(escrow.status == 3, "Escrow must be in Disputed state");
        require(msg.sender == escrow.arbitrator, "Only arbitrator can resolve dispute");

        escrow.status = 4;
        if (_releaseFunds) {
            (bool success, ) = escrow.seller.call{value: escrow.amount}("");
            require(success, "Transfer failed");
        } else {
            (bool success, ) = escrow.buyer.call{value: escrow.amount}("");
            require(success, "Transfer failed");
        }

        emit DisputeResolved(_escrowId, _releaseFunds);
    }
    
    function createProject(
        string memory _title,
        string memory _description,
        address _freelancer,
        uint256[] memory _milestoneAmounts,
        uint256 _deadline
    ) public payable {
        require(msg.value > 0, "Budget must be greater than 0");
        require(_freelancer != address(0), "Invalid freelancer address");
        require(_freelancer != msg.sender, "Freelancer cannot be the client");
        require(_milestoneAmounts.length > 0, "Must have at least one milestone");
        require(_deadline > block.timestamp, "Deadline must be in the future");

        uint256 totalBudget = 0;
        for (uint256 i = 0; i < _milestoneAmounts.length; i++) {
            totalBudget += _milestoneAmounts[i];
        }
        require(msg.value >= totalBudget, "Insufficient budget for milestones");

        uint256 projectId = projectCount++;
        projects[projectId] = Project({
            title: _title,
            description: _description,
            client: msg.sender,
            freelancer: _freelancer,
            budget: msg.value,
            status: 0,
            completedMilestones: 0,
            totalMilestones: _milestoneAmounts.length,
            deadline: _deadline
        });

        emit ProjectCreated(projectId, msg.sender, _freelancer, msg.value);
    }
    
    function completeMilestone(uint256 _projectId, uint256 _milestoneIndex) public {
        Project storage project = projects[_projectId];
        require(project.status == 1, "Project must be in progress");
        require(msg.sender == project.client, "Only client can complete milestones");
        require(_milestoneIndex < project.totalMilestones, "Invalid milestone index");
        require(_milestoneIndex == project.completedMilestones, "Milestones must be completed in order");

        project.completedMilestones++;
        emit MilestoneCompleted(_projectId, _milestoneIndex);

        if (project.completedMilestones == project.totalMilestones) {
            project.status = 2;
            emit ProjectCompleted(_projectId);
        }
    }
    
    function disputeProject(uint256 _projectId, string memory _ipfsHash) public {
        Project storage project = projects[_projectId];
        require(project.status == 1, "Project must be in progress");
        require(msg.sender == project.client || msg.sender == project.freelancer, "Only client or freelancer can raise dispute");

        project.status = 3;
        emit ProjectDisputed(_projectId, _ipfsHash);
    }
    
    function cancelProject(uint256 _projectId) public {
        Project storage project = projects[_projectId];
        require(project.status == 0 || project.status == 1, "Project must be in created or in progress state");
        require(msg.sender == project.client, "Only client can cancel project");

        project.status = 4;
        emit ProjectCancelled(_projectId);
    }
    
    function getEscrowDetails(uint256 _escrowId) public view returns (
        address buyer,
        address seller,
        address arbitrator,
        uint256 amount,
        uint8 status,
        string memory ipfsHash
    ) {
        Escrow storage escrow = escrows[_escrowId];
        return (
            escrow.buyer,
            escrow.seller,
            escrow.arbitrator,
            escrow.amount,
            escrow.status,
            escrow.ipfsHash
        );
    }
    
    function getProjectDetails(uint256 _projectId) public view returns (
        string memory title,
        string memory description,
        address client,
        address freelancer,
        uint256 budget,
        uint8 status,
        uint256 completedMilestones,
        uint256 totalMilestones,
        uint256 deadline
    ) {
        Project storage project = projects[_projectId];
        return (
            project.title,
            project.description,
            project.client,
            project.freelancer,
            project.budget,
            project.status,
            project.completedMilestones,
            project.totalMilestones,
            project.deadline
        );
    }
} 