const CSS = `
  :root { --accent: #0071E3; --bg: #F5F5F7; }
  body { background: var(--bg); direction: rtl; font-family: Assistant, sans-serif; margin: 0; }
  
  /* דף הבית */
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 20px; padding: 20px 5%; }
  .card { cursor: pointer; text-align: center; }
  .card img { width: 100%; aspect-ratio: 2/3; border-radius: 20px; object-fit: cover; box-shadow: 0 5px 15px rgba(0,0,0,0.08); }
  
  /* דף פירוט */
  .detail-view { background: #fff; min-height: 100vh; position: relative; }
  .hero-img { width: 100%; height: 50vh; object-fit: contain; background: #000; }
  .info-box { padding: 40px 10%; max-width: 900px; margin: 0 auto; }
  
  /* עיצוב תקציר הסרט - מפואר */
  .summary-container { 
    background: #FBFBFD; 
    padding: 30px; 
    border-radius: 25px; 
    margin: 30px 0; 
    border: 1px solid #E5E5E5; 
  }
  .summary-title { 
    font-size: 24px; 
    font-weight: 900; 
    margin-bottom: 10px; 
    display: flex; 
    align-items: center; 
    gap: 10px; 
  }
  .summary-line { width: 50px; height: 5px; background: var(--accent); border-radius: 10px; margin-bottom: 15px; }
  .summary-text { font-size: 19px; line-height: 1.8; color: #333; }

  /* כפתור פליי */
  .play-btn-large { 
    background: var(--accent); color: #fff; border: none; padding: 20px 60px; 
    border-radius: 20px; font-size: 22px; font-weight: bold; cursor: pointer;
    display: flex; align-items: center; gap: 15px; transition: 0.3s;
  }
  .play-btn-large:hover { transform: scale(1.05); }

  /* רשימת פרקים בשורות */
  .episodes-list { margin-top: 40px; }
  .ep-row { 
    background: #1D1D1F; color: #fff; padding: 20px; border-radius: 15px; 
    margin-bottom: 12px; display: flex; justify-content: space-between; 
    align-items: center; cursor: pointer; transition: 0.2s;
  }
  .ep-row:hover { background: var(--accent); }
  .ep-row span { font-weight: bold; font-size: 17px; }

  /* נגן */
  .player { position: fixed; inset: 0; background: #000; z-index: 9999; }
  .p-close { position: absolute; top: 20px; right: 20px; z-index: 10001; background: #fff; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; }
  .v-wrap { width: 100%; height: 100%; position: relative; }
  .v-block { position: absolute; top:0; right:0; width: 100%; height: 80px; z-index: 10000; }
  iframe { width: 100%; height: 100%; border: none; }
`;