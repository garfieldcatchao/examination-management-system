import React from "react";
import { TestBaseResultModalProps } from "../../../../interface/testBaseManagement";
import "./TestBaseResultModal.css";
import SearchResultModal from "./SearchModal";
import SearchModal from "./SearchModal";

function TestBaseResultModal(props: TestBaseResultModalProps) {
  return (
    <div>
      <SearchModal onClose={props.onClose} />
    </div>
  );
}

export default TestBaseResultModal;
