import { MoreVert, Pause, PlayArrow, VolumeUp } from "@mui/icons-material";
import React, { useState } from "react";

const Audio = ({
  handlePlay,
  play,
  handlePause,
  initialControl,
  handleVolume,
  voices,
  handleSelectedVoice,
}) => {
  const [isToggle, setIsToggle] = useState(false);

  return (
    <div>
      <div className="flex gap-3 items-center border rounded-[30px] px-3 py-3 bg-black cursor-pointer text-white">
        <div className="flex gap-1 items-center">
          {initialControl ? (
            <PlayArrow
              style={{ color: "#FFF", fontSize: "18px" }}
              onClick={handlePlay}
            />
          ) : (
            <>
              {play ? (
                <PlayArrow
                  style={{ color: "#FFF", fontSize: "18px" }}
                  onClick={handlePlay}
                />
              ) : (
                <Pause
                  style={{ color: "#FFF", fontSize: "18px" }}
                  onClick={handlePause}
                />
              )}
            </>
          )}

          <p className="text-xs">0:00 / 0:00</p>
        </div>
        <div className="w-[100px]">
          <div className="rounded-xl py-[1.5px] bg-white"></div>
        </div>
        <div className="relative">
          <div className=" flex items-center gap-2">
            <VolumeUp
              style={{ color: "#FFF", fontSize: "18px" }}
              onClick={handleVolume}
            />
            <MoreVert
              style={{ color: "#FFF", fontSize: "18px" }}
              onClick={() => {
                setIsToggle(!isToggle);
              }}
            />
          </div>

          {isToggle && (
            <div className="absolute bg-white rounded-lg py-2 cursor-pointer px-2 mt-6 shadow-md w-[250px] h-[150px] overflow-scroll right-[-45%] flex flex-col gap-2">
              {voices?.map((voice, index) => {
                return (
                  <p
                    className="text-xs text-black py-1 px-1"
                    key={index}
                    onClick={() => {
                      handleSelectedVoice(voice);
                      setIsToggle(false);
                    }}
                  >
                    {voice.name}
                  </p>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Audio;
