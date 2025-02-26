const marketCallEmail = (portfolio, callId, reciverName) => {
  return {
    subject: `Exciting News: Your New Portfolio Awaits`,
    html: `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
        }
      
      
        .content h1 {
            color: #333333;
        }
        .content p {
            color: #666666;
        }
        .cta-button {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            background-color: #007bff;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
        }
        .table-container {
            margin-top: 20px;
            overflow-x: auto;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        table, th, td {
            border: 1px solid #dddddd;
        }
        th, td {
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
        }
        .footer {
            text-align: center;
            padding-top: 20px;
            color: #999999;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        
        <div class="content">
            <h1>New Portfolio Ready!</h1>
            <p>Hello ${reciverName},</p>
            <p>We are excited to inform you that a new portfolio is ready for you. Please check it out and give us your response.</p>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Symbol</th>
                            <th>Quantity</th>
                            <th>Type</th>
                            <th>Duration</th>
                            <th>Stop Loss Price</th>
                            <th>Buy Price</th>
                            <th>Target Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${portfolio
                          ?.map(
                            (stock) =>
                              `<tr>
                            <td>${stock?.symbol || "Not Available"}</td>
                            <td>${stock?.quantity || "Not Available"}</td>
                            <td>${stock?.type || "Not Available"}</td>
                            <td>${stock?.durationType || "Not Available"}</td>
                            <td>${stock?.stopLossPrice || "Not Available"}</td>
                            <td>${stock?.buyPrice || "Not Available"}</td>
                            <td>${stock?.targetPrice || "Not Available"}</td>
                          </tr>`
                          )
                          .join(" ")}
                    </tbody>
                </table>
            </div>
            <a href="https://asset-ram.azurewebsites.net/market-call/details/${callId}" class="cta-button">View More</a>
        </div>
        <div class="footer">
            <p>© 2024 AssetRam. All rights reserved.</p>
        </div>
    </div>
</body>
</html>



      `,
  };
};

module.exports = marketCallEmail;
