import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1705017310541 implements MigrationInterface {
    name = 'Migration1705017310541'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "book_author" ADD "slug" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "book_author" ADD "description" text`);
        await queryRunner.query(`ALTER TABLE "book_author" ADD "avatar" character varying`);
        await queryRunner.query(`ALTER TABLE "book_author" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "book" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "numberOfBorrowedBooks" SET DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "numberOfBorrowedBooks" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "book_author" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "book_author" DROP COLUMN "avatar"`);
        await queryRunner.query(`ALTER TABLE "book_author" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "book_author" DROP COLUMN "slug"`);
    }

}
