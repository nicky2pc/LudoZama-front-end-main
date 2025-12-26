// Standalone implementation without dependencies to src/

// Get the base URL from environment variable or fallback to development URL
const getBaseUrl = () => {
  if (process.env.VITE_PAGE_URL) {
    return `https://${process.env.VITE_PAGE_URL}`;
  }
  return "https://896484b61160.ngrok.app"; // Fallback for local development
};

// Base embed configuration
const baseEmbedConfig = {
  version: "next",
  imageUrl: `${getBaseUrl()}/coolguy.png`,
  button: {
    title: "Ludonad",
    action: {
      type: "launch_frame",
      name: "Play the gasame",
      url: `${getBaseUrl()}?ref=embed/`,
    },
  },
};

// Generate referral page HTML
function generateReferralPage(referralCode) {
  // Create embedConfig with dynamic referral link
  const dynamicEmbedConfig = {
    ...baseEmbedConfig,
    button: {
      ...baseEmbedConfig.button,
      action: {
        ...baseEmbedConfig.button.action,
        url: `${getBaseUrl()}?ref=${referralCode}`,
      },
    },
  };

  // Generate HTML with the meta tag and styled button
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="fc:frame" content='${JSON.stringify(dynamicEmbedConfig)}'>
  <title>Referral Link</title>
  <style>
    body, html {
      margin: 0;
      padding: 0;
      height: 100%;
      width: 100%;
      font-family: Arial, sans-serif;
    }
    
    .container {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      background-color: #000;
      background-size: cover;
      background-position: center;
    }
    
    /* Mobile background */
    @media (max-width: 768px) {
      .container {
        background-image: url('/LoadScreen.png');
      }
    }
    
    /* Desktop background */
    @media (min-width: 769px) {
      .container {
        background-image: url('/coolguy.png');
      }
    }
    
    .start-button {
      padding: 1rem 2.5rem;
      font-size: 1.25rem;
      background-color: #8a2be2; /* Purple */
      color: #fff;
      border: 4px solid #ffffff;
      border-radius: 12px;
      cursor: pointer;
      box-shadow: 0 0 16px rgba(138, 43, 226, 0.6);
      transition: all 0.3s ease;
      font-weight: bold;
      letter-spacing: 1px;
      text-transform: uppercase;
      text-decoration: none;
    }
    
    .start-button:hover {
      background-color: #9932cc;
      transform: scale(1.05);
    }
  </style>
</head>
<body>
  <div class="container">
    <a href="${getBaseUrl()}?ref=${referralCode}" class="start-button">
      Start Game
    </a>
  </div>
</body>
</html>
  `;
}

export default function handler(req, res) {
  // Extract the referral code from the URL
  const { referralCode } = req.query;

  // Generate the HTML page
  const html = generateReferralPage(referralCode);

  // Set content type and send response
  res.setHeader("Content-Type", "text/html");
  res.status(200).send(html);
}
