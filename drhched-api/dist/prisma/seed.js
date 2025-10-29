"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const crypto = __importStar(require("crypto"));
const prisma = new client_1.PrismaClient();
const hash = (pwd) => crypto.createHash('sha256').update(pwd).digest('hex');
async function main() {
    const company = await prisma.company.upsert({
        where: { id: 'seed-company' },
        update: {},
        create: { id: 'seed-company', name: 'Empresa Demo' },
    });
    const branch = await prisma.branch.upsert({
        where: { id: 'seed-branch' },
        update: {},
        create: { id: 'seed-branch', name: 'Sucursal Demo', companyId: company.id },
    });
    await prisma.user.upsert({
        where: { email: 'admin@demo.local' },
        update: {},
        create: {
            email: 'admin@demo.local',
            password: hash('Admin123!'),
            role: client_1.UserRole.ADMIN,
            companyId: company.id,
            branchId: branch.id,
        },
    });
    console.log('✅ Seed listo: Empresa Demo, Sucursal Demo, Usuario admin@demo.local / Admin123!');
}
main()
    .then(async () => { await prisma.$disconnect(); })
    .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
//# sourceMappingURL=seed.js.map