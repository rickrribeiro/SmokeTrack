
import React, { useEffect, useState } from 'react';
import { SmokingRecord } from '../types';
import Modal from './Modal';
import RecordForm, { RecordFormValues } from './RecordForm';

interface EditRecordModalProps {
  record: SmokingRecord | null; // null = fechado
  smokingTypes: string[];
  activities: string[];
  notes: string[];
  onClose: () => void;
  onSave: (record: SmokingRecord) => void;
}

const toFormValues = (record: SmokingRecord): RecordFormValues => ({
  smokeType: record.smokeType,
  activity: record.activity,
  dateTime: new Date(record.dateTime).toISOString().slice(0, 16),
  mood: record.mood,
  note: record.note,
});

const EditRecordModal: React.FC<EditRecordModalProps> = ({ record, smokingTypes, activities, notes, onClose, onSave }) => {
  const [values, setValues] = useState<RecordFormValues | null>(record ? toFormValues(record) : null);

  // Reinicializa o formulário sempre que um registro diferente é aberto para edição
  useEffect(() => {
    if (record) {
      setValues(toFormValues(record));
    }
  }, [record?.id]);

  const handleSave = () => {
    if (!record || !values) return;
    onSave({
      ...record,
      smokeType: values.smokeType,
      activity: values.activity,
      dateTime: new Date(values.dateTime).toISOString(),
      mood: values.mood,
      note: values.note,
    });
    onClose();
  };

  return (
    <Modal isOpen={!!record} onClose={onClose} title="Editar Registro">
      {values && (
        <div className="space-y-4">
          <RecordForm
            smokingTypes={smokingTypes}
            activities={activities}
            notes={notes}
            values={values}
            onChange={setValues}
          />
          <button
            onClick={handleSave}
            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all"
          >
            Salvar Alterações
          </button>
        </div>
      )}
    </Modal>
  );
};

export default EditRecordModal;
