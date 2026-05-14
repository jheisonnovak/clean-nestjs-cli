import { Orm } from "../../utils/clean-config";

export const appModuleElement = (orm: Orm): string => `import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
${orm === "typeorm" ? `import { TypeOrmModule } from "@nestjs/typeorm";\nimport { DatabaseConfigService } from "./shared/databases/database.config.service";` : ""}${
	orm === "prisma" ? `import { PrismaModule } from "./shared/databases/prisma.module";` : ""
}

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		${orm === "typeorm" ? "TypeOrmModule.forRootAsync({ useClass: DatabaseConfigService })," : ""}${orm === "prisma" ? "PrismaModule," : ""}
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
`;
