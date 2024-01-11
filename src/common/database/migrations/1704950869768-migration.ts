import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1704950869768 implements MigrationInterface {
    name = 'Migration1704950869768'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "slug" character varying NOT NULL`);
        await queryRunner.query(`INSERT INTO "user"("id", "createdAt", "updatedAt", "name", "verifiedEmail", "notVerifiedEmail", "password", "role", "deletedAt","slug") VALUES (DEFAULT, DEFAULT, DEFAULT, 'admin', 'admin@liberary.com', DEFAULT, '$2b$12$T8DI19XklrJS2fL8koW1VepVG2Yf6IYO1CPW0IJno3fIZv8hvY38y', 'ADMIN', DEFAULT,'admin-1') RETURNING "id", "createdAt", "updatedAt", "role", "deletedAt"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "slug"`);
    }

}
