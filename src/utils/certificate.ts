export interface CertificateParams {
  userName: string;
  courseTitle: string;
  score: number;
  total: number;
  completedAt: string;
}

export function generateCertificateHtml(p: CertificateParams): string {
  const percent = Math.round((p.score / p.total) * 100);
  const date = new Date(p.completedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif;
      background: #f7f9fc;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 40px;
    }

    .cert {
      background: #ffffff;
      width: 780px;
      padding: 0;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 40px rgba(0,0,0,0.10);
      position: relative;
    }

    /* Top accent bar */
    .cert-top {
      background: linear-gradient(135deg, #0050cb 0%, #0066ff 100%);
      padding: 40px 56px 36px;
      position: relative;
      overflow: hidden;
    }
    .cert-top::after {
      content: '';
      position: absolute;
      bottom: -30px;
      right: -30px;
      width: 160px;
      height: 160px;
      border-radius: 50%;
      background: rgba(255,255,255,0.07);
    }
    .cert-top::before {
      content: '';
      position: absolute;
      top: -40px;
      left: 200px;
      width: 220px;
      height: 220px;
      border-radius: 50%;
      background: rgba(255,255,255,0.05);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 28px;
    }
    .brand-icon {
      width: 48px;
      height: 48px;
      background: rgba(255,255,255,0.2);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      font-weight: 800;
      color: #fff;
    }
    .brand-name {
      font-size: 24px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.5px;
    }

    .cert-label {
      font-size: 13px;
      font-weight: 600;
      color: rgba(255,255,255,0.75);
      text-transform: uppercase;
      letter-spacing: 2.5px;
    }
    .cert-title {
      font-size: 36px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.8px;
      margin-top: 6px;
      line-height: 1.15;
    }

    /* Body */
    .cert-body {
      padding: 48px 56px 40px;
    }

    .presented-to {
      font-size: 14px;
      color: #727687;
      font-weight: 500;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
    }
    .student-name {
      font-size: 44px;
      font-weight: 800;
      color: #191c1e;
      letter-spacing: -1.2px;
      line-height: 1.1;
      margin-bottom: 28px;
      padding-bottom: 28px;
      border-bottom: 2px solid #eceef1;
    }

    .completion-text {
      font-size: 16px;
      color: #424656;
      line-height: 1.7;
      margin-bottom: 8px;
    }
    .course-name {
      font-size: 24px;
      font-weight: 700;
      color: #0050cb;
      letter-spacing: -0.4px;
      line-height: 1.3;
      margin-bottom: 36px;
    }

    /* Meta row */
    .meta-row {
      display: flex;
      align-items: center;
      gap: 24px;
      flex-wrap: wrap;
    }
    .meta-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .meta-label {
      font-size: 11px;
      font-weight: 600;
      color: #727687;
      text-transform: uppercase;
      letter-spacing: 1.2px;
    }
    .meta-value {
      font-size: 16px;
      font-weight: 700;
      color: #191c1e;
    }
    .meta-divider {
      width: 1px;
      height: 36px;
      background: #e0e3e6;
    }

    /* Score badge */
    .score-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #e8f5e9;
      border: 1.5px solid #a5d6a7;
      border-radius: 999px;
      padding: 8px 18px;
      margin-left: auto;
    }
    .score-badge-dot {
      width: 8px;
      height: 8px;
      background: #2e7d32;
      border-radius: 50%;
    }
    .score-badge-text {
      font-size: 14px;
      font-weight: 700;
      color: #1b5e20;
    }

    /* Footer */
    .cert-footer {
      background: #f2f4f7;
      padding: 20px 56px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .footer-text {
      font-size: 12px;
      color: #727687;
    }
    .footer-accent {
      width: 48px;
      height: 4px;
      background: linear-gradient(90deg, #0050cb, #cc4204);
      border-radius: 2px;
    }
  </style>
</head>
<body>
  <div class="cert">
    <!-- Top band -->
    <div class="cert-top">
      <div class="brand">
        <div class="brand-icon">SF</div>
        <span class="brand-name">SkillForge</span>
      </div>
      <div class="cert-label">Official Certificate</div>
      <div class="cert-title">Certificate of<br>Completion</div>
    </div>

    <!-- Body -->
    <div class="cert-body">
      <div class="presented-to">Proudly presented to</div>
      <div class="student-name">${escapeHtml(p.userName)}</div>

      <div class="completion-text">has successfully completed the course</div>
      <div class="course-name">${escapeHtml(p.courseTitle)}</div>

      <div class="meta-row">
        <div class="meta-item">
          <span class="meta-label">Completed on</span>
          <span class="meta-value">${date}</span>
        </div>
        <div class="meta-divider"></div>
        <div class="meta-item">
          <span class="meta-label">Quiz score</span>
          <span class="meta-value">${p.score} / ${p.total}</span>
        </div>
        <div class="score-badge">
          <div class="score-badge-dot"></div>
          <span class="score-badge-text">Passed · ${percent}%</span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="cert-footer">
      <span class="footer-text">Issued by SkillForge · skillforge.app</span>
      <div class="footer-accent"></div>
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
