import React, { useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist/build/pdf";

pdfjsLib.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.mjs`;

const Home = () => {
  const [isPdfUploaded, setIsPdfUploaded] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [text, setText] = useState("");

  const sanitizeText = (text) => {
    return text
      .replace(/[^a-zA-Z0-9\s.,'-]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  const handleTextToSpeech = (textContent) => {
    const sanitizedText = sanitizeText(textContent);
    const utterance = new SpeechSynthesisUtterance(sanitizedText);
    setAudioUrl(utterance);
    window.speechSynthesis.speak(utterance);

    utterance.onend = () => {
      console.log("Speech synthesis finished.");
    };
  };

  const handlePDF = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = async () => {
      const typedarray = new Uint8Array(reader.result);
      const pdf = await pdfjsLib.getDocument(typedarray).promise;

      let textContent = "";

      // Extract text from each page of the PDF
      const pageTexts = await Promise.all(
        Array.from({ length: pdf.numPages }, async (_, i) => {
          const page = await pdf.getPage(i + 1);
          const text = await page.getTextContent();
          return text.items.map((item) => item.str).join(" ");
        })
      );

      textContent = pageTexts.join(" ");
      setText(textContent);
      handleTextToSpeech(textContent);
      setIsPdfUploaded(true);
    };
  };

  return (
    <div>
      {!isPdfUploaded ? (
        <div className="flex gap-2 flex-col justify-center items-center h-screen">
          <input
            type="file"
            onChange={(event) => handlePDF(event)}
            accept=".pdf"
          />
        </div>
      ) : (
        <div className="flex flex-col gap-3 justify-center items-center h-screen">
          <audio controls src={audioUrl} />
          <button
            className="border px-4 py-2 rounded-lg text-sm mt-2"
            onClick={() => handleTextToSpeech(text)}
          >
            Read again
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
