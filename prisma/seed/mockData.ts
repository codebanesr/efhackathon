import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const splitSql = (sql: string) => {
  return sql.split(';').filter(content => content.trim() !== '')
}

async function main() {
  const sql = `

INSERT INTO "User" ("id", "email", "name", "pictureUrl", "tokenInvitation", "status", "globalRole", "password") VALUES ('4ce9b4b2-71a1-4061-a80b-2dbbfe99fa98', '1Fred_Stehr74@gmail.com', 'John Doe', 'https://i.imgur.com/YfJQV5z.png?id=3', 'xyz789ghj012', 'VERIFIED', 'USER', '$2b$10$ppubsZypHzkqW9dkhMB97ul2.wSsvaCoDE2CzqIHygddRMKXvpYUC');
INSERT INTO "User" ("id", "email", "name", "pictureUrl", "tokenInvitation", "status", "globalRole", "password") VALUES ('95a15c48-3a48-45b6-80e8-9ff33d5252b5', '17Helene.Smitham90@gmail.com', 'Jane Smith', 'https://i.imgur.com/YfJQV5z.png?id=19', 'xyz789ghj012', 'VERIFIED', 'USER', '$2b$10$ppubsZypHzkqW9dkhMB97ul2.wSsvaCoDE2CzqIHygddRMKXvpYUC');
INSERT INTO "User" ("id", "email", "name", "pictureUrl", "tokenInvitation", "status", "globalRole", "password") VALUES ('0b30d7a4-0f98-48de-986f-a6b3e8034d85', '25Weston_Lueilwitz14@hotmail.com', 'John Doe', 'https://i.imgur.com/YfJQV5z.png?id=27', 'abc123def456', 'VERIFIED', 'USER', '$2b$10$ppubsZypHzkqW9dkhMB97ul2.wSsvaCoDE2CzqIHygddRMKXvpYUC');
INSERT INTO "User" ("id", "email", "name", "pictureUrl", "tokenInvitation", "status", "globalRole", "password") VALUES ('3eb53f3c-9c50-4e6a-8970-6c7339a56031', '33Deondre33@hotmail.com', 'John Doe', 'https://i.imgur.com/YfJQV5z.png?id=35', 'abc123def456', 'VERIFIED', 'USER', '$2b$10$ppubsZypHzkqW9dkhMB97ul2.wSsvaCoDE2CzqIHygddRMKXvpYUC');
INSERT INTO "User" ("id", "email", "name", "pictureUrl", "tokenInvitation", "status", "globalRole", "password") VALUES ('f6cb00f7-42f7-44a4-a356-aa35301d2d80', '41Karen.Ankunding@yahoo.com', 'Alex Johnson', 'https://i.imgur.com/YfJQV5z.png?id=43', 'ijk567stu890', 'VERIFIED', 'USER', '$2b$10$ppubsZypHzkqW9dkhMB97ul2.wSsvaCoDE2CzqIHygddRMKXvpYUC');
INSERT INTO "User" ("id", "email", "name", "pictureUrl", "tokenInvitation", "status", "globalRole", "password") VALUES ('49715260-897a-460b-ab93-3483b8f767a0', '49Kayla90@gmail.com', 'Michael Brown', 'https://i.imgur.com/YfJQV5z.png?id=51', 'rst901uvw234', 'VERIFIED', 'USER', '$2b$10$ppubsZypHzkqW9dkhMB97ul2.wSsvaCoDE2CzqIHygddRMKXvpYUC');
INSERT INTO "User" ("id", "email", "name", "pictureUrl", "tokenInvitation", "status", "globalRole", "password") VALUES ('7a3d3b13-2a85-43ae-b04d-0af200e20bbd', '57Velma25@hotmail.com', 'Alex Johnson', 'https://i.imgur.com/YfJQV5z.png?id=59', 'abc123def456', 'VERIFIED', 'USER', '$2b$10$ppubsZypHzkqW9dkhMB97ul2.wSsvaCoDE2CzqIHygddRMKXvpYUC');
INSERT INTO "User" ("id", "email", "name", "pictureUrl", "tokenInvitation", "status", "globalRole", "password") VALUES ('559f2553-35a9-4b9c-9111-7926bfbc827d', '65Flavio50@yahoo.com', 'Michael Brown', 'https://i.imgur.com/YfJQV5z.png?id=67', 'xyz789ghj012', 'VERIFIED', 'USER', '$2b$10$ppubsZypHzkqW9dkhMB97ul2.wSsvaCoDE2CzqIHygddRMKXvpYUC');
INSERT INTO "User" ("id", "email", "name", "pictureUrl", "tokenInvitation", "status", "globalRole", "password") VALUES ('30a91065-0d79-4338-8250-5be6a11d4bda', '73Emmanuelle73@hotmail.com', 'Emily Davis', 'https://i.imgur.com/YfJQV5z.png?id=75', 'rst901uvw234', 'VERIFIED', 'USER', '$2b$10$ppubsZypHzkqW9dkhMB97ul2.wSsvaCoDE2CzqIHygddRMKXvpYUC');

INSERT INTO "Organization" ("id", "name", "pictureUrl") VALUES ('d060a956-6805-4206-839c-e213f0a50fb0', 'Green Solutions Ltd.', 'https://i.imgur.com/YfJQV5z.png?id=82');
INSERT INTO "Organization" ("id", "name", "pictureUrl") VALUES ('f94678c2-6bf7-4380-882d-7ba94e3cac50', 'Future Builders Group', 'https://i.imgur.com/YfJQV5z.png?id=85');
INSERT INTO "Organization" ("id", "name", "pictureUrl") VALUES ('06fb0135-7da3-4eab-a7b1-abe99dc9e9f4', 'Creative Minds Co.', 'https://i.imgur.com/YfJQV5z.png?id=88');
INSERT INTO "Organization" ("id", "name", "pictureUrl") VALUES ('54207f53-53d3-4376-be6e-11e50de70a5f', 'Global Ventures LLC', 'https://i.imgur.com/YfJQV5z.png?id=91');
INSERT INTO "Organization" ("id", "name", "pictureUrl") VALUES ('f2bbd8c6-e315-4781-87ac-ed84c74b5e29', 'Creative Minds Co.', 'https://i.imgur.com/YfJQV5z.png?id=94');
INSERT INTO "Organization" ("id", "name", "pictureUrl") VALUES ('0e273619-a273-4319-b279-6c83d1da4af5', 'Global Ventures LLC', 'https://i.imgur.com/YfJQV5z.png?id=97');
INSERT INTO "Organization" ("id", "name", "pictureUrl") VALUES ('575985ba-e2fd-4684-945c-adf6a2ee3cae', 'Global Ventures LLC', 'https://i.imgur.com/YfJQV5z.png?id=100');
INSERT INTO "Organization" ("id", "name", "pictureUrl") VALUES ('93351b0b-4b04-42f1-a929-793b06453287', 'Creative Minds Co.', 'https://i.imgur.com/YfJQV5z.png?id=103');
INSERT INTO "Organization" ("id", "name", "pictureUrl") VALUES ('4fb680fa-5f0a-48fe-bcda-1d917cabd2e8', 'Global Ventures LLC', 'https://i.imgur.com/YfJQV5z.png?id=106');
INSERT INTO "Organization" ("id", "name", "pictureUrl") VALUES ('953708c3-d0fa-4df5-982d-646e4a4d9642', 'Future Builders Group', 'https://i.imgur.com/YfJQV5z.png?id=109');

INSERT INTO "OrganizationRole" ("id", "name", "userId", "organizationId") VALUES ('11c9dcf9-588c-45e6-9993-ba9361b1f841', 'Project Manager', '0b30d7a4-0f98-48de-986f-a6b3e8034d85', 'f2bbd8c6-e315-4781-87ac-ed84c74b5e29');
INSERT INTO "OrganizationRole" ("id", "name", "userId", "organizationId") VALUES ('e085179c-05f0-4e5b-92f1-8161f33a28b3', 'Project Manager', '559f2553-35a9-4b9c-9111-7926bfbc827d', '06fb0135-7da3-4eab-a7b1-abe99dc9e9f4');
INSERT INTO "OrganizationRole" ("id", "name", "userId", "organizationId") VALUES ('c6e4f9f7-3df2-4911-940a-6439b4c16759', 'Project Manager', '3eb53f3c-9c50-4e6a-8970-6c7339a56031', 'd060a956-6805-4206-839c-e213f0a50fb0');
INSERT INTO "OrganizationRole" ("id", "name", "userId", "organizationId") VALUES ('7afb9d1c-3671-4a71-93f2-ca280dd31539', 'Quality Assurance', '3eb53f3c-9c50-4e6a-8970-6c7339a56031', '06fb0135-7da3-4eab-a7b1-abe99dc9e9f4');
INSERT INTO "OrganizationRole" ("id", "name", "userId", "organizationId") VALUES ('e5e43ea5-416a-45ef-96d7-8e2efcdf59be', 'Developer', '30a91065-0d79-4338-8250-5be6a11d4bda', '575985ba-e2fd-4684-945c-adf6a2ee3cae');
INSERT INTO "OrganizationRole" ("id", "name", "userId", "organizationId") VALUES ('1a0c26fd-f6e3-478d-b16d-714ff6640dcb', 'Team Lead', '559f2553-35a9-4b9c-9111-7926bfbc827d', '54207f53-53d3-4376-be6e-11e50de70a5f');
INSERT INTO "OrganizationRole" ("id", "name", "userId", "organizationId") VALUES ('263eef30-a641-4506-a777-0fd0f7075cae', 'Designer', '0b30d7a4-0f98-48de-986f-a6b3e8034d85', 'd060a956-6805-4206-839c-e213f0a50fb0');
INSERT INTO "OrganizationRole" ("id", "name", "userId", "organizationId") VALUES ('89fbf71c-63ee-46d5-af71-95f63e495eb3', 'Team Lead', '4ce9b4b2-71a1-4061-a80b-2dbbfe99fa98', '953708c3-d0fa-4df5-982d-646e4a4d9642');
INSERT INTO "OrganizationRole" ("id", "name", "userId", "organizationId") VALUES ('9aa2283b-12a9-4cf7-b185-a86c21cfe6a6', 'Developer', 'f6cb00f7-42f7-44a4-a356-aa35301d2d80', '4fb680fa-5f0a-48fe-bcda-1d917cabd2e8');
INSERT INTO "OrganizationRole" ("id", "name", "userId", "organizationId") VALUES ('f027fb63-0053-49b1-802f-f24489201661', 'Project Manager', '21a857f1-ba5f-4435-bcf6-f910ec07c0dc', '0e273619-a273-4319-b279-6c83d1da4af5');
  `

  const sqls = splitSql(sql)

  for (const sql of sqls) {
    try {
      await prisma.$executeRawUnsafe(`${sql}`)
    } catch (error) {
      console.log(`Could not insert SQL: ${error.message}`)
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async error => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
