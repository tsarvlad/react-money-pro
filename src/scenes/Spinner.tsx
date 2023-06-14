import React from "react";
import ScaleLoader from "react-spinners/ScaleLoader";

type Props = {
    blur?: boolean;
}

const Spinner: React.FC<Props> = ({ blur }) => {
    return (
        <div className={`flex absolute h-[100%] w-[100%] justify-center items-center z-20 bg-[rgba(250,250,250,0.5)] ${blur && 'backdrop-blur-sm'}`}>
            <ScaleLoader
                height={'50px'}
                width={'6px'}
                aria-label="Loading Spinner"
                data-testid="loader"
                loading
            />
        </div>
    );
}

export default Spinner;