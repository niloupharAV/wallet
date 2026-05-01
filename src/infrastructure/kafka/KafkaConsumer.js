import { kafka } from "./kafka";
import {IConsumer} from "../../application/port/out/messaging/IConsumer.js";

export class KafkaConsumer extends IConsumer {
    constructor(group) {
        super();
        this.kafkaConsumer = kafka.consumer({ groupId: group });

    }

    async startConsumer(topic) {
        await this.kafkaConsumer.connect();
        await this.kafkaConsumer.subscribe({
            topic,
            fromBeginning: false,
        });

        await this.kafkaConsumer.run({
            eachMessage: async ({ message }) => {
                const job = JSON.parse(message.value);
              //  await handleTransaction(job);
            },
        });
    }
}

