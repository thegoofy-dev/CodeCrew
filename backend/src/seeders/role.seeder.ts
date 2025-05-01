import "dotenv/config";
import mongoose from "mongoose";
import connectDatabase from "../config/db.config";
import RoleModel from "../models/roles-permission.model";
import { RolePermissions } from "../utils/role-permission";

const seedRoles = async () => {
    console.log('Seeding Roles Started....');

    try {
        await connectDatabase();
        const session = await mongoose.startSession();
        session.startTransaction();
        console.log("clearing existing roles...");
        await RoleModel.deleteMany({}, { session });

        for (const roleName in RolePermissions) {
            const role = roleName as keyof typeof RolePermissions;
            const permissions = RolePermissions[role];

            // Check if the role already exits
            const existingRole = await RoleModel.findOne({ name: role }).session(session);

            if (!existingRole) {
                const newRole = new RoleModel({
                    name: role,
                    Permissions: permissions
                })
                await newRole.save({ session });
                console.log(`Role ${role} added with permissions.`);
            }
            else {
                console.log(`Role ${role} aready exists.`);
            }
        }

        await session.commitTransaction();
        console.log("Transaction committed");

        session.endSession();
        console.log("session Ended");

        console.log("Seeding Completed Sucessfully");
    } catch (error) {
        console.log("Error during seeding:", error);
    }
};

seedRoles().catch((error) =>
  console.error("Error running seed script:", error)
);