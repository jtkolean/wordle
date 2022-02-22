import React from "react";

const Code = (props) => (
  <pre>
    {JSON.stringify(
      props.value,
      null,
      // (key, value) => {
      //   return key === "wordle" ? "*****" : value;
      // },
      "  "
    )}
  </pre>
);

export default Code;
