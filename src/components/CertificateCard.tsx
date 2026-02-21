"use client";

import React, { useRef } from 'react';
import { format } from 'date-fns';
import { Award, Download, Trophy, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CertificateCardProps {
  certificate: {
    certificate_id: string;
    player_name: string;
    tournament_name: string;
    rank: number | null;
    certificate_type: string;
    issued_at: string;
  };
}

const CertificateCard: React.FC<CertificateCardProps> = ({ certificate }) => {
  const certRef = useRef<HTMLDivElement>(null);

  const getRankLabel = (rank: number | null, type: string) => {
    if (type === 'winner' || rank === 1) return '🥇 1st Place - Champion';
    if (rank === 2) return '🥈 2nd Place - Runner Up';
    if (rank === 3) return '🥉 3rd Place';
    if (type === 'participation') return 'Participant';
    return `#${rank} Place`;
  };

  const handleDownloadPDF = () => {
    if (!certRef.current) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Certificate - ${certificate.player_name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@300;400;500;600&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    @page { 
      size: landscape A4; 
      margin: 0; 
    }
    
    body {
      width: 297mm;
      height: 210mm;
      font-family: 'Inter', sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      background: white;
    }
    
    .certificate {
      width: 277mm;
      height: 190mm;
      border: 3px solid #c9a84c;
      border-radius: 8px;
      padding: 20mm;
      position: relative;
      background: linear-gradient(135deg, #fefefe 0%, #f8f6f0 100%);
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    
    .certificate::before {
      content: '';
      position: absolute;
      top: 4mm;
      left: 4mm;
      right: 4mm;
      bottom: 4mm;
      border: 1px solid #d4b85c;
      border-radius: 4px;
      pointer-events: none;
    }
    
    .corner-ornament {
      position: absolute;
      width: 30mm;
      height: 30mm;
      border: 2px solid #c9a84c;
    }
    .corner-ornament.tl { top: 8mm; left: 8mm; border-right: none; border-bottom: none; }
    .corner-ornament.tr { top: 8mm; right: 8mm; border-left: none; border-bottom: none; }
    .corner-ornament.bl { bottom: 8mm; left: 8mm; border-right: none; border-top: none; }
    .corner-ornament.br { bottom: 8mm; right: 8mm; border-left: none; border-top: none; }
    
    .trophy { font-size: 48px; margin-bottom: 5mm; }
    
    .title {
      font-family: 'Playfair Display', serif;
      font-size: 36pt;
      font-weight: 900;
      color: #1a1a1a;
      letter-spacing: 4px;
      text-transform: uppercase;
      margin-bottom: 3mm;
    }
    
    .subtitle {
      font-size: 11pt;
      color: #888;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 8mm;
    }
    
    .certify-text {
      font-size: 11pt;
      color: #666;
      margin-bottom: 3mm;
    }
    
    .player-name {
      font-family: 'Playfair Display', serif;
      font-size: 28pt;
      font-weight: 700;
      color: #c9a84c;
      margin-bottom: 5mm;
      border-bottom: 2px solid #c9a84c;
      padding-bottom: 3mm;
      display: inline-block;
    }
    
    .achievement {
      font-size: 14pt;
      font-weight: 600;
      color: #333;
      margin-bottom: 3mm;
    }
    
    .tournament-name {
      font-family: 'Playfair Display', serif;
      font-size: 16pt;
      font-weight: 700;
      color: #555;
      margin-bottom: 8mm;
    }
    
    .footer {
      display: flex;
      justify-content: space-between;
      width: 100%;
      margin-top: auto;
      padding-top: 5mm;
      border-top: 1px solid #eee;
    }
    
    .footer-item {
      font-size: 8pt;
      color: #999;
    }
    
    .footer-item strong {
      display: block;
      color: #666;
      font-size: 9pt;
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="corner-ornament tl"></div>
    <div class="corner-ornament tr"></div>
    <div class="corner-ornament bl"></div>
    <div class="corner-ornament br"></div>
    
    <div class="trophy">🏆</div>
    <div class="title">Certificate</div>
    <div class="subtitle">of ${certificate.certificate_type === 'winner' ? 'Achievement' : certificate.certificate_type === 'participation' ? 'Participation' : 'Excellence'}</div>
    
    <div class="certify-text">This is to certify that</div>
    <div class="player-name">${certificate.player_name}</div>
    
    <div class="achievement">${getRankLabel(certificate.rank, certificate.certificate_type)}</div>
    <div class="tournament-name">${certificate.tournament_name}</div>
    
    <div class="footer">
      <div class="footer-item">
        <strong>Certificate ID</strong>
        ${certificate.certificate_id}
      </div>
      <div class="footer-item">
        <strong>ChessMaster</strong>
        Official Tournament Platform
      </div>
      <div class="footer-item">
        <strong>Date Issued</strong>
        ${format(new Date(certificate.issued_at), 'MMMM d, yyyy')}
      </div>
    </div>
  </div>
  <script>
    window.onload = function() { 
      setTimeout(function() { window.print(); }, 500); 
    };
  </script>
</body>
</html>`;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="space-y-4">
      {/* Preview */}
      <div 
        ref={certRef}
        className="bg-gradient-to-br from-background to-muted/50 rounded-lg p-6 border-2 border-primary/30 relative overflow-hidden"
      >
        <div className="absolute top-2 left-2 right-2 bottom-2 border border-primary/10 rounded pointer-events-none" />
        
        <div className="text-center space-y-3">
          <Trophy className="h-12 w-12 text-primary mx-auto" />
          
          <h2 className="font-heading text-2xl tracking-widest uppercase">Certificate</h2>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            of {certificate.certificate_type === 'winner' ? 'Achievement' : 
                certificate.certificate_type === 'participation' ? 'Participation' : 'Excellence'}
          </p>
          
          <p className="text-sm text-muted-foreground">This certifies that</p>
          <h3 className="text-2xl font-bold text-primary border-b-2 border-primary inline-block pb-1">
            {certificate.player_name}
          </h3>
          
          <p className="text-lg font-semibold">
            {getRankLabel(certificate.rank, certificate.certificate_type)}
          </p>
          <p className="text-base font-medium text-muted-foreground">{certificate.tournament_name}</p>
          
          <div className="flex justify-between text-xs text-muted-foreground pt-4 border-t mt-4">
            <span>ID: {certificate.certificate_id}</span>
            <span>Issued: {format(new Date(certificate.issued_at), 'MMM d, yyyy')}</span>
          </div>
        </div>
      </div>

      {/* Download Button */}
      <Button onClick={handleDownloadPDF} className="w-full gold-gradient text-primary-foreground" size="lg">
        <Download className="mr-2 h-5 w-5" />
        Download Certificate (PDF)
      </Button>
    </div>
  );
};

export default CertificateCard;


