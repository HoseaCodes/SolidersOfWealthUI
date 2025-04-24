// https://og-playground.vercel.app/
<div
  style={{
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(to bottom, #1a2639 0%, #2c3e50 100%)',
    fontFamily: 'Impact, Arial Black, sans-serif',
    color: 'white',
    padding: '40px',
    boxSizing: 'border-box',
    position: 'relative',
    overflow: 'hidden'
  }}
>
  {/* Background honeycomb pattern */}
  <div
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      opacity: 0.1,
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 30 L30 0 L60 30 L30 60 Z' fill='none' stroke='white' stroke-width='2'/%3E%3C/svg%3E")`,
      backgroundSize: '60px 60px',
      display: 'flex'
    }}
  />
      
  {/* Top border */}
  <div
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '8px',
      background: '#4A5D23',
      display: 'flex'
    }}
  />
      
  {/* Military-style border corners */}
  <div
    style={{
      position: 'absolute',
      top: '20px',
      left: '20px',
      width: '30px',
      height: '30px',
      borderTop: '5px solid #D4AF37',
      borderLeft: '5px solid #D4AF37',
      display: 'flex'
    }}
  />
  <div
    style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      width: '30px',
      height: '30px',
      borderTop: '5px solid #D4AF37',
      borderRight: '5px solid #D4AF37',
      display: 'flex'
    }}
  />
  <div
    style={{
      position: 'absolute',
      bottom: '20px',
      left: '20px',
      width: '30px',
      height: '30px',
      borderBottom: '5px solid #D4AF37',
      borderLeft: '5px solid #D4AF37',
      display: 'flex'
    }}
  />
  <div
    style={{
      position: 'absolute',
      bottom: '20px',
      right: '20px',
      width: '30px',
      height: '30px',
      borderBottom: '5px solid #D4AF37',
      borderRight: '5px solid #D4AF37',
      display: 'flex'
    }}
  />
      
  {/* Left side soldier silhouette */}
  <div
    style={{
      position: 'absolute',
      left: '50px',
      bottom: '50px',
      width: '250px',
      height: '400px',
      opacity: 0.7,
      display: 'flex'
    }}
  >
    <svg viewBox="0 0 100 160" fill="#4A5D23">
      <path d="M50,0 C60,20 80,10 80,30 C80,40 70,45 70,50 C70,60 60,65 60,70 C60,80 65,85 65,95 C65,100 60,105 60,110 C60,120 65,125 65,135 C65,145 55,150 50,160 C45,150 35,145 35,135 C35,125 40,120 40,110 C40,105 35,100 35,95 C35,85 40,80 40,70 C40,65 30,60 30,50 C30,45 20,40 20,30 C20,10 40,20 50,0 Z" />
    </svg>
  </div>
      
  {/* Right side financial bar chart */}
  <div
    style={{
      position: 'absolute',
      right: '80px',
      bottom: '80px',
      width: '250px',
      height: '300px',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
    }}
  >
    <div style={{ width: '40px', height: '220px', background: '#1E3D59', marginRight: '10px' }} />
    <div style={{ width: '40px', height: '160px', background: '#C1292E', marginRight: '10px' }} />
    <div style={{ width: '40px', height: '280px', background: '#D4AF37', marginRight: '10px' }} />
    <div style={{ width: '40px', height: '180px', background: '#4A5D23', marginRight: '10px' }} />
  </div>
      
  {/* Main Title */}
  <div
    style={{
      textAlign: 'center',
      marginBottom: '20px',
      zIndex: 2,
      display: 'flex',
      flexDirection: 'column'
    }}
  >
    <h1
      style={{
        fontSize: '96px',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        margin: 0,
        textShadow: '4px 4px 6px rgba(0,0,0,0.5)',
        fontWeight: 'bold',
      }}
    >
      SOLDIERS OF
    </h1>
    <h1
      style={{
        fontSize: '120px',
        color: '#D4AF37',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        margin: 0,
        textShadow: '4px 4px 6px rgba(0,0,0,0.5)',
        fontWeight: 'bold',
      }}
    >
      WEALTH
    </h1>
  </div>
      
  {/* Tagline */}
  <div
    style={{
      textAlign: 'center',
      zIndex: 2,
      display: 'flex'
    }}
  >
    <p
      style={{
        fontSize: '32px',
        fontFamily: 'Arial, sans-serif',
        margin: 0,
        letterSpacing: '1px',
        color: '#A9B4C2',
      }}
    >
      THE ULTIMATE FINANCIAL STRATEGY GAME
    </p>
  </div>
      
  {/* Bottom banner */}
  <div
    style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      background: '#4A5D23',
      padding: '15px 0',
      textAlign: 'center',
      display: 'flex',
      justifyContent: 'center'
    }}
  >
    <p
      style={{
        margin: 0,
        fontSize: '24px',
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold',
      }}
    >
      BUILD YOUR ARMY • INVEST WISELY • CONQUER THE BATTLEFIELD
    </p>
  </div>
</div>