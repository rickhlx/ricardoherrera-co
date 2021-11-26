import React from "react";
import useDarkMode from "use-dark-mode";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { FiMoon, FiSun } from "react-icons/fi";
import tw from "twin.macro";

const DarkModeIcon = styled(FiMoon)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0",
});

const DefaultModeIcon = styled(FiSun)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0",
});

const DarkModeToggle = () => {
  const darkMode = useDarkMode();

  return (
    <button
      id="dark-mode-toggle"
      css={css(
        {
          transition: "all 0.3 ease",
        },
        tw`flex border-0 rounded-full w-10 h-10 p-0 m-0 
        items-center justify-center text-current`
      )}
      type="button"
      onClick={darkMode.toggle}
    >
      {darkMode.value ? <DefaultModeIcon /> : <DarkModeIcon />}
    </button>
  );
};

export default DarkModeToggle;
