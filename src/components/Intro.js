import React, { useState, useEffect } from 'react';

function Intro() {
    const [currencies, setCurrencies] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [resultValue, setResultValue] = useState('');
    const [currency1, setCurrency1] = useState('');
    const [currency2, setCurrency2] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [logoutError, setLogoutError] = useState('');

    const handleLogout = async () => {
        try {
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            };
            const response = await fetch('https://goldratecalculator-backend.onrender.com/logout', options);
            if (response.status === 200) {
                localStorage.removeItem('token');
                // Redirect to login page after successful logout
                window.location.href = '/';
            } else {
                // Handle error if logout fails
                const data = await response.json();
                if (data.error) {
                    setLogoutError(data.error);
                } else {
                    setLogoutError('An error occurred during logout.');
                }
            }
        } catch (err) {
            setLogoutError('An error occurred during logout.');
        }
    };

    useEffect(() => {
        fetch('https://api.frankfurter.app/currencies')
            .then(res => res.json())
            .then(data => {
                setCurrencies(Object.entries(data));
                setCurrency1(Object.keys(data)[0]);
                setCurrency2(Object.keys(data)[1]);
            })
            .catch(error => console.error('Error fetching currencies:', error));
    }, []);

    useEffect(() => {
        if (inputValue && currency1 && currency2 && currency1 !== currency2) {
            convert(currency1, currency2, inputValue);
        }
    }, [inputValue, currency1, currency2]);

    const convert = (curr1, curr2, value) => {
        if (value === '') {
            setResultValue('');
            setAlertMessage('');
            return;
        }

        if (curr1 === curr2) {
            setAlertMessage('Choose different currencies');
        } else {
            setAlertMessage('');
            fetch(`https://api.frankfurter.app/latest?amount=${value}&from=${curr1}&to=${curr2}`)
                .then(resp => resp.json())
                .then(data => {
                    setResultValue(Object.values(data.rates)[0]);
                })
                .catch(error => console.error('Error fetching currency data:', error));
        }
    };

    return (
        <div className="container mt-5">
            <button className="btn btn-primary mb-3" onClick={handleLogout}>Logout</button>
            {logoutError && <p className="text-danger">{logoutError}</p>}
            <div className="card p-4 bg-dark text-white">
                <h1 className="card-title text-center">Currency Converter</h1>
                <div className="box d-flex justify-content-between">
                    <div className="left-box w-50 me-2">
                        <select value={currency1} onChange={e => setCurrency1(e.target.value)} className="form-select mb-3 bg-warning">
                            {currencies.map(([code, name]) => (
                                <option key={code} value={code}>
                                    {code} ({name})
                                </option>
                            ))}
                        </select>
                        <input
                            type="number"
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            className="form-control bg-secondary text-white"
                            id="input"
                        />
                    </div>
                    <div className="right-box w-50 ms-2">
                        <select value={currency2} onChange={e => setCurrency2(e.target.value)} className="form-select mb-3 bg-warning">
                            {currencies.map(([code, name]) => (
                                <option key={code} value={code}>
                                    {code} ({name})
                                </option>
                            ))}
                        </select>
                        <input
                            type="number"
                            value={resultValue}
                            readOnly
                            className="form-control bg-secondary text-white"
                            id="result"
                        />
                    </div>
                </div>
                <div className="alertbox mt-3">
                    <p className="text-warning" id="alert">{alertMessage}</p>
                </div>
            </div>
        </div>
    );
}

export default Intro;
