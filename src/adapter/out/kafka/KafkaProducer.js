import { kafka } from "./config/KafkaConfig.js";
import {IProducer} from "../../../application/port/out/messaging/IProducer.js";

export class KafkaProducer extends IProducer{
    constructor() {
        super();
        this.kafkaClient = kafka.producer();
    }

    async connectProducer() {
        await this.kafkaClient.connect();
    }

    async produce(data, topic, key) {
        await this.kafkaClient.send({
            topic,
            messages: [
                {
                    key,
                    value: JSON.stringify(data),
                },
            ],
        });
    }


}
