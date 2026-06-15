import { EmptyState } from './EmptyState';

export function VisitFields({ fields }) {
    if (!fields.length) {
        return <EmptyState text="Данные визита не найдены" />;
    }
    
    return (
        <div className="visit-fields">
            {fields.map((field, index) => (
                <div className="visit-field" key={`${field.title}-${index}`}>
                    <span className={field.title_cssclass}>{field.title}</span>
                    <span className={field.val_cssclass}>
                        {field.title === 'Qrcode3' ? (
                            <span dangerouslySetInnerHTML={{ __html: field.val }} />
                        ) : (
                            field.val
                        )}
                    </span>
                </div>
            ))}
        </div>
    );
}
