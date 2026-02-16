export default function GridView({ items, onSelect }) {
  return (
    <div style={{ padding: '100px 40px', maxWidth: '1600px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '24px', marginBottom: '20px', fontWeight: '600' }}>
        נוספו לאחרונה
      </h2>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
        gap: '20px' 
      }}>
        {items.map((item) => (
          <div 
            key={item.id} 
            className="card-hover" 
            onClick={() => onSelect(item)} 
            style={{ 
              borderRadius: '8px', 
              overflow: 'hidden', 
              position: 'relative', 
              aspectRatio: '2/3', 
              cursor: 'pointer',
              background: 'var(--card)',
            }}
          >
            <img 
              src={item.cover} 
              alt={item.title} 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover' 
              }} 
            />
            <div style={{ 
              position: 'absolute', 
              bottom: 0, 
              left: 0, 
              right: 0, 
              padding: '10px', 
              background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', 
              color: '#fff' 
            }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                {item.title}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>
                {item.year}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}