import { AppData } from "@/types";

const validateRecords = (data: AppData): boolean => {
    console.log("Invalid record format detected")
    data.records = data.records.map(record => {

        if (typeof record.id !== 'string') record.id = crypto.randomUUID();
        console.log(typeof record.smokeType)

        if(typeof record.smokeType !== 'string' ||
        typeof record.activity !== 'string' ||
        typeof record.dateTime !== 'string' ||
        isNaN(new Date(record.dateTime).getTime())){
            throw "Invalid record format";
        }
        console.log(record)
        return record;
    });
        
    return true;
}


export {
    validateRecords
}