require('dotenv').config({ path: '.env' })
import { supportedEnvVars } from "./types";

export const getEnv = (envVar: supportedEnvVars) => {
    const resp = process.env[envVar];
    if(resp === undefined) throw new Error(`'${envVar}' Environment Variable is Not Defined`);
    else return resp as string;
}

export const getEnvJson = (envVar: supportedEnvVars) => {
    return JSON.parse(getEnv(envVar)) as Array<string>;
}

export const parseSerialFromAnswerData = (data: string): (false | Date) => {
    let dataItems = data.split(' ');
    let timestamp = dataItems[2];
    if (timestamp.length === 10){
        try {
            if (parseInt(timestamp.slice(0, 2)) <= 16){
                return new Date(parseInt(timestamp+"000"));
            }
            else {
                return new Date(
                    parseInt(timestamp.slice(0, 4)),
                    parseInt(timestamp.slice(4, 6)),
                    parseInt(timestamp.slice(6, 8)),
                    0,
                    0,
                    0,
                    0
                );
            }
            } catch (error) {
            return false;
        }
    }
    else {
        return false;
    }
}
