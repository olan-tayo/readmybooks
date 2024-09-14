import React, { useEffect, useState } from "react";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import Audio from "../components/Audio/Audio";

pdfjsLib.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.mjs`;

const Home = () => {
  const [isPdfUploaded, setIsPdfUploaded] = useState(false);
  const [text, setText] = useState("");
  const [isPaused, setIsPaused] = useState(false);
  const [utterance, setUtterance] = useState(null);
  const [initialControl, setInitialControl] = useState(true);
  const [volume, setVolume] = useState(1);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState([]);

  const sanitizeText = (text) => {
    return text
      .replace(/[^a-zA-Z0-9\s.,'-]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  const handlePlayAudio = () => {
    const synth = window.speechSynthesis;

    if (isPaused) {
      synth.resume();
    }

    synth.speak(utterance);
    setInitialControl(false);
    setIsPaused(false);
  };

  const handlePause = () => {
    const synth = window.speechSynthesis;

    synth.pause();
    setInitialControl(false);
    setIsPaused(true);
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
      handlePlayAudio();
      setIsPdfUploaded(true);
    };
  };

  const handleStop = () => {
    const synth = window.speechSynthesis;

    synth.cancel();
    setInitialControl(true);
    setIsPaused(false);
  };

  const handleVolume = () => {
    setVolume(Math.random().toFixed(1));
  };

  const handleSelectedVoice = (data) => {
    window.speechSynthesis.cancel();
    setInitialControl(true);
    setSelectedVoice(data);
    if (utterance) {
      const newUtterance = new SpeechSynthesisUtterance(utterance.text);
      newUtterance.voice = data;
      newUtterance.rate = utterance.rate;
      newUtterance.pitch = utterance.pitch;
      newUtterance.volume = utterance.volume;

      // Speak the new utterance with the updated voice
      window.speechSynthesis.speak(newUtterance);
    }
  };

  useEffect(() => {
    const synth = window.speechSynthesis;
    const speech = sanitizeText(text);
    const rawUtterance = new SpeechSynthesisUtterance(speech);
    window.speechSynthesis.onvoiceschanged = () => {
      const voice = window.speechSynthesis.getVoices();
      setVoices(voice);
    };
    setUtterance(rawUtterance);
    setInitialControl(true);

    return () => {
      synth.cancel();
    };
  }, [text]);

  useEffect(() => {
    if (utterance) {
      utterance.rate = volume;
    }
  }, [volume, utterance, selectedVoice]);

  console.log(utterance);

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
          <Audio
            handlePlay={handlePlayAudio}
            handlePause={handlePause}
            play={isPaused}
            initialControl={initialControl}
            handleVolume={handleVolume}
            voices={voices}
            handleSelectedVoice={handleSelectedVoice}
          />
          <button
            onClick={handleStop}
            className="border px-4 py-2 rounded-lg text-sm mt-2"
          >
            Stop Audio
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
