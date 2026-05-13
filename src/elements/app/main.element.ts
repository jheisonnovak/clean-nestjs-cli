export const mainElement = (): string => `import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap(): Promise<void> {
	const app = await NestFactory.create(AppModule);
	app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

	const config = new DocumentBuilder()
		.setTitle("Clean Architecture API")
		.setDescription("API generated with Clean NestJS CLI")
		.setVersion(process.env.npm_package_version ?? "0.0.0")
		.build();
	const documentFactory = (): OpenAPIObject => SwaggerModule.createDocument(app, config);
	SwaggerModule.setup("api/docs", app, documentFactory);

	await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
`;
