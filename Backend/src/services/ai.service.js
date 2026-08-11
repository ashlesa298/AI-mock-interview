const puppeteer = require("puppeteer");

// -----------------------------
// Generate Interview Report
// -----------------------------
async function generateInterviewReport() {
    return {
        title: "Software Engineer",

        matchScore: 85,

        technicalQuestions: [
            {
                question: "What is OOP?",
                intention: "Check Java knowledge",
                answer: "Explain Encapsulation, Inheritance, Polymorphism and Abstraction."
            }
        ],

        behavioralQuestions: [
            {
                question: "Tell me about yourself.",
                intention: "Know the candidate.",
                answer: "Introduce yourself confidently."
            }
        ],

        skillGaps: [
            {
                skill: "System Design",
                severity: "medium"
            }
        ],

        preparationPlan: [
            {
                day: 1,
                focus: "Java",
                tasks: [
                    "Practice OOP",
                    "Solve Java questions"
                ]
            }
        ]
    };
}

// -----------------------------
// Generate PDF from HTML
// -----------------------------
async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch();

    const page = await browser.newPage();

    await page.setContent(htmlContent, {
        waitUntil: "networkidle0",
    });

    const pdfBuffer = await page.pdf({
        format: "A4",
        margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm",
        },
    });

    await browser.close();

    return pdfBuffer;
}

// -----------------------------
// Generate Resume PDF
// -----------------------------
async function generateResumePdf({
    resume,
    selfDescription,
    jobDescription,
}) {

    const html = `
    <html>
    <head>
        <style>
            body{
                font-family: Arial;
                padding:30px;
            }
            h1{
                color:#333;
            }
            h2{
                color:#555;
            }
        </style>
    </head>

    <body>

        <h1>Resume</h1>

        <h2>Resume Content</h2>
        <p>${resume || ""}</p>

        <h2>Self Description</h2>
        <p>${selfDescription || ""}</p>

        <h2>Job Description</h2>
        <p>${jobDescription || ""}</p>

    </body>

    </html>
    `;

    return await generatePdfFromHtml(html);
}

module.exports = {
    generateInterviewReport,
    generateResumePdf,
};