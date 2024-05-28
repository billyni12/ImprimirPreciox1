document.getElementById('generatePDF').addEventListener('click', () => {
    const input = document.getElementById('csvFileInput').files[0];
    if (input) {
        Papa.parse(input, {
            header: true,
            skipEmptyLines: true,
            complete: function(results) {
                generatePDF(results.data);
            }
        });
    } else {
        alert('Por favor, selecciona un archivo CSV.');
    }
});

function formatPrice(price) {
    if (!price) return { integerPart: '', decimalPart: '' };
    const formattedPrice = `S/.${parseFloat(price).toFixed(2)}`;
    const integerPart = Math.trunc(parseFloat(price)).toString();
    const decimalPart = (parseFloat(price).toFixed(2).split('.')[1]);
    return { integerPart, decimalPart };
}

function generatePDF(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [80, 70]
    });

    data.forEach((row, index) => {
        if (index > 0) doc.addPage([80, 70]);

        let yOffset = 15;  // Start position at the top for each new page

        // Set font to bold for the name
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(25);

        // Split the name into multiple lines if necessary
        const nameLines = doc.splitTextToSize(row.Nombre || '', 60);
        nameLines.forEach((line, i) => {
            doc.text(line, 10, yOffset);
            yOffset += 10;  // Move to the next line
        });

        // Reset font to normal for the prices
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(14);
            yOffset += 0;
        // Loop through prices and adjust font size for Precio1
        ['Px1', 'Px2', 'Px3'].forEach((precio, i) => {
            const price = formatPrice(row[precio]);
            if (price.integerPart) {
                const priceYOffset = yOffset + 8 * (i + 1);
                const label = precio + ": ";
                doc.text(label, 10, priceYOffset);
                const labelWidth = doc.getTextWidth(label);

                // Adjust font size for Precio1
                if (precio == 'Px1') {
                    doc.setFontSize(35);
                    const textWidth = doc.getTextWidth(`S/.${price.integerPart}`);
                    const rectWidth = 2 + labelWidth + textWidth + doc.getTextWidth(`.${price.decimalPart}`);
                    const rectHeight = 14;  // Height of the row
                    doc.rect(8, priceYOffset -11, rectWidth, rectHeight); // Draw the border
                    doc.text(`S/.${price.integerPart}`, 10 + labelWidth, priceYOffset);
                    if (price.decimalPart) {
                        const textWidth = doc.getTextWidth(`S/.${price.integerPart}`);
                        doc.setFontSize(11);
                        doc.text(`.${price.decimalPart}`, 10 + labelWidth + textWidth, priceYOffset-3);
                    }
                } else {
                    doc.setFontSize(12);
                    doc.text(`S/.${price.integerPart}`, 10 + labelWidth, priceYOffset);
                    if (price.decimalPart) {
                        const textWidth = doc.getTextWidth(`S/.${price.integerPart}`);
                        doc.setFontSize(8);
                        doc.text(`.${price.decimalPart}`, 10 + labelWidth + textWidth, priceYOffset-1);
                    }
                }
                // Reset font size for next price
                doc.setFontSize(12);
            }
        });
    });

    doc.save('ticket.pdf');
}
