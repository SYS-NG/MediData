# MediData: Decentralized Medical Data Storage on Internet Computer Blockchain

We are on the chain: https://tb4eb-piaaa-aaaao-a2uzq-cai.icp0.io/

Welcome to MediData, a revolutionary platform developed for the ChainShift Hackathon, leveraging the power of the Internet Computer blockchain to provide a secure and decentralized solution for medical data storage. MediData ensures transparent and efficient tracking, viewing, and modification of patient data while empowering patients with control over doctor access to their information. This Repo is a proof-of-concept used to show potential functionality of MediData.

To get started, you might want to explore the project directory structure and the default configuration file. Working with this project in your development environment will not affect any production deployment or identity tokens.

## Features

- **Decentralized Data Storage**: MediData utilizes the Internet Computer blockchain to ensure the security and immutability of medical records.

- **Patient Empowerment**: Patients have the ability to review and modify access permissions for doctors, putting them in control of their own data.

- **Transparent Tracking**: The platform enables easy tracking of modifications to patient data, ensuring transparency and accountability.

- **Efficient Data Management**: MediData streamlines the process of storing and retrieving medical records, making it a user-friendly solution for both healthcare providers and patients.

# How It Works

1. **Blockchain Storage**: Patient data is stored securely on the Internet Computer blockchain, providing a tamper-proof and decentralized storage solution.

2. **Access Control**: Patients can review and modify access permissions for healthcare providers, enhancing privacy and data control.

3. **Audit Trail**: Every modification to patient data is recorded on the blockchain, creating a transparent and auditable history of changes.

## Getting Started Locally

Follow these steps to get started with MediData:

1. **Clone the Repository:**
    ```bash
    git clone https://github.com/SYS-NG/MediData.git
    ```
2. **Starts the replica, running in the background**
   ```bash
   cd MediData
   dfx start --background

   # Deploys your canisters to the replica and generates your candid interface
   dfx deploy
   ```

## Technologies Used

- Internet Computer Blockchain
- JavaScript/TypeScript
- Motoko

## Team
- Alden Lien - [@aldenlien](https://github.com/aldenlien)
- Jack Li - [@jackl16](https://github.com/jackl16)
- Steven Ng - [@SYS-NG](https://github.com/SYS-NG)

## Acknowledgments

- Thanks to ChainShift Hackathon for providing the opportunity to develop MediData.
- Special thanks to the Internet Computer community for their support and resources.
