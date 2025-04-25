import { S3Client } from "@aws-sdk/client-s3";
import { config } from "dotenv";

config();

const region = process.env.AWS_S3_REGION;
const endpoint = process.env.AWS_S3_ENDPOINT_URL;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const bucket = process.env.AWS_S3_BUCKET_NAME;

let s3Client = null;

if (!region || !endpoint || !accessKeyId || !secretAccessKey || !bucket) {
    console.error(
        "-------------------------------------------------------------"
    );
    console.error("!!! ОШИБКА КОНФИГУРАЦИИ S3 КЛИЕНТА !!!");
    console.error("Отсутствует одна или несколько переменных окружения:");
    console.error(`  AWS_S3_REGION: ${region ? "OK" : "ОТСУТСТВУЕТ!"}`);
    console.error(`  AWS_S3_ENDPOINT_URL: ${endpoint ? "OK" : "ОТСУТСТВУЕТ!"}`);
    console.error(
        `  AWS_ACCESS_KEY_ID: ${accessKeyId ? "OK" : "ОТСУТСТВУЕТ!"}`
    );
    console.error(
        `  AWS_SECRET_ACCESS_KEY: ${
            secretAccessKey ? "OK (загружен)" : "ОТСУТСТВУЕТ!"
        }`
    );
    console.error(`  AWS_S3_BUCKET_NAME: ${bucket ? "OK" : "ОТСУТСТВУЕТ!"}`);
    console.error("Пожалуйста, проверьте ваш файл .env.");
    console.error("S3 клиент НЕ будет инициализирован.");
    console.error(
        "-------------------------------------------------------------"
    );
} else {
    s3Client = new S3Client({
        region: region,
        endpoint: endpoint,
        credentials: {
            accessKeyId: accessKeyId,
            secretAccessKey: secretAccessKey,
        },
        forcePathStyle: true,
    });
    console.log(
        `S3 Клиент успешно инициализирован для региона ${region}, эндпоинта ${endpoint}, бакета ${bucket}`
    );
}

export default s3Client;
