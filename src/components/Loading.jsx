export function Loading({ text = 'Загрузка...' }) {
    return (
        <div className="state state_loading">
            <span className="loading-dot" />
            <p>{text}</p>
        </div>
    );
}
