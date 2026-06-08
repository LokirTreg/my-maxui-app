import { EmptyState } from './EmptyState';

export function WarehouseContacts({ fields }) {
    if (!fields.length) {
        return <EmptyState text="Контакты склада не указаны" />;
    }

    return (
        <div className="warehouse-contacts">
            {fields.map((field, index) => (
                <p className={field.cssclass} key={`${field.text}-${index}`}>
                    {field.text}
                </p>
            ))}
        </div>
    );
}
