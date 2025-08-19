export async function generateStoryImage(
  record: {
    title: string;
    artist: string;
    releaseYear?: number | null;
    genre?: string | null;
    type?: string | null;
    imageUrl?: string | null;
    coverImageUrl?: string | null;
  },
  ownerName: string = "Vinyl Collection",
  username?: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }
    
    canvas.width = 1080;
    canvas.height = 1920;
    
    // Draw background gradient
    const gradient = ctx.createLinearGradient(0, 0, 1080, 1920);
    gradient.addColorStop(0, '#1c1917');
    gradient.addColorStop(0.5, '#292524');
    gradient.addColorStop(1, '#1c1917');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1920);
    
    // Add subtle circles for visual interest
    ctx.globalAlpha = 0.03;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(200, 300, 150, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(880, 500, 100, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(150, 1600, 200, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(930, 1400, 120, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    
    // Draw NOW SPINNING header
    ctx.font = 'bold 48px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#10b981';
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur = 20;
    ctx.fillText('NOW SPINNING', 540, 160);
    ctx.shadowBlur = 0;
    
    // Draw pulsing circle
    ctx.fillStyle = '#10b981';
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.arc(540, 220, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    
    // Function to draw album art or placeholder
    const drawAlbumArt = () => {
      return new Promise<void>((artResolve) => {
        const albumUrl = record.coverImageUrl || record.imageUrl;
        
        // Helper function to draw placeholder
        const drawPlaceholder = () => {
          ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
          ctx.shadowBlur = 25;
          ctx.shadowOffsetY = 15;
          ctx.fillStyle = '#292524';
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(90, 280, 900, 900, 32);
          } else {
            const x = 90, y = 280, w = 900, h = 900, r = 32;
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + w - r, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + r);
            ctx.lineTo(x + w, y + h - r);
            ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            ctx.lineTo(x + r, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - r);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.closePath();
          }
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.shadowOffsetY = 0;
          
          ctx.font = '64px system-ui';
          ctx.fillStyle = '#57534e';
          ctx.textAlign = 'center';
          ctx.fillText('♪', 540, 730);
          ctx.font = '36px system-ui';
          ctx.fillText('No Cover Art', 540, 800);
        };
        
        if (albumUrl) {
          // Try multiple approaches to load the image
          const loadImage = async () => {
            
            // First attempt: try loading with CORS for external images
            const tryLoadWithCORS = () => new Promise<boolean>((resolve) => {
              const corsImg = new Image();
              if (albumUrl.startsWith('http')) {
                corsImg.crossOrigin = 'anonymous';
              }
              
              corsImg.onload = () => {
                drawImageToCanvas(corsImg);
                resolve(true);
              };
              
              corsImg.onerror = () => resolve(false);
              corsImg.src = albumUrl;
            });
            
            // Second attempt: try loading without CORS
            const tryLoadWithoutCORS = () => new Promise<boolean>((resolve) => {
              const noCorsImg = new Image();
              
              noCorsImg.onload = () => {
                try {
                  drawImageToCanvas(noCorsImg);
                  resolve(true);
                } catch (error) {
                  console.warn('Canvas tainted, cannot draw image:', error);
                  resolve(false);
                }
              };
              
              noCorsImg.onerror = () => resolve(false);
              noCorsImg.src = albumUrl;
            });
            
            // Helper function to draw image with styling
            const drawImageToCanvas = (imgElement: HTMLImageElement) => {
              ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
              ctx.shadowBlur = 25;
              ctx.shadowOffsetY = 15;
              
              ctx.save();
              ctx.beginPath();
              if (ctx.roundRect) {
                ctx.roundRect(90, 280, 900, 900, 32);
              } else {
                const x = 90, y = 280, w = 900, h = 900, r = 32;
                ctx.moveTo(x + r, y);
                ctx.lineTo(x + w - r, y);
                ctx.quadraticCurveTo(x + w, y, x + w, y + r);
                ctx.lineTo(x + w, y + h - r);
                ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
                ctx.lineTo(x + r, y + h);
                ctx.quadraticCurveTo(x, y + h, x, y + h - r);
                ctx.lineTo(x, y + r);
                ctx.quadraticCurveTo(x, y, x + r, y);
                ctx.closePath();
              }
              ctx.clip();
              ctx.drawImage(imgElement, 90, 280, 900, 900);
              ctx.restore();
              
              ctx.shadowBlur = 0;
              ctx.shadowOffsetY = 0;
            };
            
            // Try loading approaches in order
            const corsSuccess = await tryLoadWithCORS();
            if (corsSuccess) {
              artResolve();
              return;
            }
            
            const noCorsSuccess = await tryLoadWithoutCORS();
            if (noCorsSuccess) {
              artResolve();
              return;
            }
            
            // If both fail, draw placeholder
            drawPlaceholder();
            artResolve();
          };
          
          loadImage();
        } else {
          // Draw placeholder when no URL provided
          drawPlaceholder();
          artResolve();
        }
      });
    };
    
    // Draw the rest after album art loads
    drawAlbumArt().then(() => {
      // Draw vinyl record rings
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(540, 730, 450, 0, Math.PI * 2);
      ctx.stroke();
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.arc(540, 730, 50, 0, Math.PI * 2);
      ctx.stroke();
      
      // Draw title
      ctx.font = 'bold 64px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      const title = record.title.length > 22 ? record.title.substring(0, 22) + '...' : record.title;
      ctx.fillText(title, 540, 1280);
      
      // Draw artist
      ctx.font = '48px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#d6d3d1';
      const artist = record.artist.length > 25 ? record.artist.substring(0, 25) + '...' : record.artist;
      ctx.fillText(artist, 540, 1360);
      
      // Draw metadata pills
      ctx.font = 'bold 32px system-ui';
      
      let xOffset = 540;
      const pillSpacing = 20;
      const pills: { text: string; width: number }[] = [];
      
      // Calculate pill widths
      if (record.releaseYear) {
        const text = record.releaseYear.toString();
        const width = ctx.measureText(text).width + 40;
        pills.push({ text, width });
      }
      if (record.genre) {
        const text = record.genre.length > 10 ? record.genre.substring(0, 10) + '...' : record.genre;
        const width = ctx.measureText(text).width + 40;
        pills.push({ text, width });
      }
      if (record.type) {
        const text = record.type;
        const width = ctx.measureText(text).width + 40;
        pills.push({ text, width });
      }
      
      // Calculate starting position to center pills
      const totalWidth = pills.reduce((sum, pill) => sum + pill.width, 0) + (pills.length - 1) * pillSpacing;
      xOffset = 540 - totalWidth / 2;
      
      // Draw pills
      pills.forEach((pill) => {
        // Draw pill background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(xOffset, 1430, pill.width, 60, 30);
        } else {
          const x = xOffset, y = 1430, w = pill.width, h = 60, r = 30;
          ctx.moveTo(x + r, y);
          ctx.lineTo(x + w - r, y);
          ctx.quadraticCurveTo(x + w, y, x + w, y + r);
          ctx.lineTo(x + w, y + h - r);
          ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
          ctx.lineTo(x + r, y + h);
          ctx.quadraticCurveTo(x, y + h, x, y + h - r);
          ctx.lineTo(x, y + r);
          ctx.quadraticCurveTo(x, y, x + r, y);
          ctx.closePath();
        }
        ctx.fill();
        ctx.stroke();
        
        // Draw pill text
        ctx.fillStyle = 'white';
        ctx.fillText(pill.text, xOffset + pill.width / 2, 1470);
        
        xOffset += pill.width + pillSpacing;
      });
      
      // Draw collection name
      ctx.font = 'bold 40px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#a8a29e';
      ctx.textAlign = 'center';
      ctx.fillText(`${ownerName}'s Collection`, 540, 1700);
      
      // Draw username if provided
      if (username) {
        ctx.font = '32px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#78716c';
        ctx.fillText(`@${username}`, 540, 1780);
      }
      
      // Draw branding
      ctx.font = '24px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#57534e';
      ctx.fillText('Vinyl Collection', 540, 1870);
      
      // Convert canvas to data URL
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          resolve(url);
        } else {
          reject(new Error('Failed to create blob'));
        }
      }, 'image/jpeg', 0.95);
    });
  });
}