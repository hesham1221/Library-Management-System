import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1704947270019 implements MigrationInterface {
    name = 'Migration1704947270019'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_verification_code_usecase_enum" AS ENUM('PASSWORD_RESET', 'EMAIL_VERIFICATION')`);
        await queryRunner.query(`CREATE TABLE "user_verification_code" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "useCase" "public"."user_verification_code_usecase_enum" NOT NULL DEFAULT 'PASSWORD_RESET', "code" character varying NOT NULL, "expiryDate" TIMESTAMP NOT NULL, "userId" uuid, CONSTRAINT "PK_a82f7853b7c83fb01318ed276e1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('BORROWER', 'ADMIN')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "verifiedEmail" character varying, "notVerifiedEmail" character varying, "password" character varying NOT NULL, "role" "public"."user_role_enum" NOT NULL DEFAULT 'BORROWER', "deletedAt" TIMESTAMP, CONSTRAINT "UQ_094bfc4a6e29de7996d4b3cdc22" UNIQUE ("verifiedEmail"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_verification_code" ADD CONSTRAINT "FK_2c5fb8c5671cb426211beca14e8" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_verification_code" DROP CONSTRAINT "FK_2c5fb8c5671cb426211beca14e8"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`DROP TABLE "user_verification_code"`);
        await queryRunner.query(`DROP TYPE "public"."user_verification_code_usecase_enum"`);
    }

}
