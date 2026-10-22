import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User.js';
import { RegistryModel } from '../models/Registry.js';
import { connectMongoDB } from '../config/db.js';

export async function seedMongoDatabase() {
  const isConnected = await connectMongoDB();
  if (!isConnected) {
    console.log('[Mongo Seed] Skipped: MongoDB not connected.');
    return;
  }

  try {
    const userCount = await UserModel.countDocuments();
    if (userCount === 0) {
      console.log('[Mongo Seed] Seeding demo user accounts...');
      const salt = bcrypt.genSaltSync(10);
      const demoUsers = [
        {
          id: 'usr_emp1',
          username: 'employee1',
          passwordHash: bcrypt.hashSync('Emp@12345', salt),
          role: 'employee',
          name: 'Arjun Kumar',
          email: 'arjun.kumar@acme-corp.internal',
          department: 'Software Engineering',
        },
        {
          id: 'usr_emp2',
          username: 'employee2',
          passwordHash: bcrypt.hashSync('Emp@12345', salt),
          role: 'employee',
          name: 'Priya Sharma',
          email: 'priya.sharma@acme-corp.internal',
          department: 'Cybersecurity Operations',
        },
        {
          id: 'usr_hradmin',
          username: 'hradmin',
          passwordHash: bcrypt.hashSync('HR@12345', salt),
          role: 'hr',
          name: 'Sarah Jenkins',
          email: 'sarah.jenkins@acme-corp.internal',
          department: 'Human Resources & Talent Compliance',
        },
      ];
      await UserModel.insertMany(demoUsers);
      console.log('[Mongo Seed] Demo users created in MongoDB.');
    }

    const regCount = await RegistryModel.countDocuments();
    if (regCount === 0) {
      console.log('[Mongo Seed] Seeding institutional registry records...');
      const demoRegistry = [
        {
          certificateId: 'DEMO-CERT-1001',
          recipientName: 'Arjun Kumar',
          issuingInstitution: 'Example Technical Institute',
          certificateType: 'Web Development',
          issueDate: '15 August 2025',
          status: 'VALID',
          accreditationCode: 'ETI-ACCRED-2025-998',
          credentialHash: 'sha256-8a7f9e2b1c4d0a9f538e1b6a7c8d9e0f',
          issuerAuthority: 'Example Technical Institute Board of Certifications',
          issuerKeyFingerprint: '9B:4E:A2:71:08:92:DF:5C:30',
          tamperProtectionEnabled: true,
          remarks: 'Official registered certificate record. Fully verified and accredited.',
        },
        {
          certificateId: 'DEMO-CERT-2002',
          recipientName: 'Vikram Malhotra',
          issuingInstitution: 'Example Technical Institute',
          certificateType: 'Cybersecurity Fundamentals',
          issueDate: '15 August 2025',
          status: 'VALID',
          accreditationCode: 'ETI-ACCRED-2025-442',
          credentialHash: 'sha256-4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f',
          issuerAuthority: 'Example Technical Institute Board of Certifications',
          issuerKeyFingerprint: '9B:4E:A2:71:08:92:DF:5C:30',
          tamperProtectionEnabled: true,
          remarks: 'Official institutional registry record. Recipient on record: Vikram Malhotra.',
        },
        {
          certificateId: 'DEMO-CERT-3003',
          recipientName: 'Rohan Verma',
          issuingInstitution: 'National Cloud Computing Academy',
          certificateType: 'Cloud Architecture & DevOps',
          issueDate: '10 September 2025',
          status: 'VALID',
          accreditationCode: 'NCCA-2025-771',
          credentialHash: 'sha256-11223344556677889900aabbccddeeff',
          issuerAuthority: 'National Cloud Computing Academy Registrar',
          issuerKeyFingerprint: '7A:3F:B1:88:99:AA:BB:CC:DD',
          tamperProtectionEnabled: true,
          remarks: 'Official registered record for Cloud Architecture credentials.',
        },
      ];
      await RegistryModel.insertMany(demoRegistry);
      console.log('[Mongo Seed] Registry records created in MongoDB.');
    }
  } catch (err) {
    console.error('[Mongo Seed] Error during seed:', err.message);
  }
}
