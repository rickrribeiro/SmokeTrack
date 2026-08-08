import { AppData } from "@/types";
import { MOOD_OPTIONS } from "@/constants";

const VALID_MOODS = MOOD_OPTIONS.map(m => m.value);

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

        // Campos opcionais: se presentes mas em formato inválido, descarta
        // silenciosamente em vez de invalidar o registro inteiro (são cosméticos).
        if (record.mood !== undefined && !VALID_MOODS.includes(record.mood)) {
            delete record.mood;
        }
        if (record.note !== undefined && typeof record.note !== 'string') {
            delete record.note;
        }

        console.log(record)
        return record;
    });

    return true;
}


export {
    validateRecords
}