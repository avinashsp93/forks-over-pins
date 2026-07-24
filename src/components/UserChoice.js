import { useState, useEffect } from "react";

export default function UserChoice() {
    const [mate, setMate] = useState(1);

    return <div className="container">
        <div className="row">
            <label className="col-sm-6">What do you want to do?</label>
            <select className="col-sm-6 form-select form-select-md" value={mate} onChange={(event) => {setMate(event.target.value)}}>
                <option value={1}>Mate in 1 move</option>
                <option value={2}>Mate in 2 moves</option>
                <option value={3}>Mate in 3 moves</option>
            </select>
        </div>
    </div>
}