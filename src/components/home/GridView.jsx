import React from "react";
import { motion } from "framer-motion";

export default function GridView({ items, onSelect }) {
  return (
    <div style={{ 
      padding: '40px', 
      maxWidth: '1600px', 
      margin: '0 auto' 
    }}>
      <h2 style={{ 
        fontSize: '24px', 
        marginBottom: '30px', 
        fontWeight: 'bold' 
      }}>
        נוספו לאחרונה
      </h2>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
        gap: '25px' 
      }}>
        {items.map((item) => (
          <motion.div
            key={item.id}
            className="card-hover"
            onClick={() => onSelect(item)}
            style={{ 
              cursor: 'pointer', 
              borderRadius: '12px', 
              overflow: 'hidden',
              position: 'relative',
            }}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.2 }}
          >
            <div style={{ 
              aspectRatio: '2/3', 
              position: 'relative',
              background: '#000',
            }}>
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
                padding: '20px', 
                background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
              }}>
                <h3 style={{ 
                  fontSize: '16px', 
                  fontWeight: 'bold', 
                  margin: '0 0 5px 0',
                  color: 'white',
                }}>
                  {item.title}
                </h3>
                <p style={{ 
                  fontSize: '14px', 
                  margin: 0, 
                  opacity: 0.8,
                  color: 'white',
                }}>
                  {item.year}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}