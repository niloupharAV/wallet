
import express from "express";
import {register} from "./registery.js";

const app = express();
app.use(express.json());

register(app);


const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
