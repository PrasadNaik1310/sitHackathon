import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AadhaarStep() {
	const navigate = useNavigate();
	const [aadhaar, setAadhaar] = useState(localStorage.getItem('kyc_aadhaar') || '');
	const [error, setError] = useState('');

	const onNext = () => {
		const trimmed = aadhaar.trim();
		if (!/^\d{12}$/.test(trimmed)) {
			setError('Please enter a valid 12-digit Aadhaar number.');
			return;
		}

		localStorage.setItem('kyc_aadhaar', trimmed);
		navigate('/onboarding/gst');
	};

	return (
		<div style={{ minHeight: '100vh', background: '#f0eaeae1', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
			<div style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 16, padding: 22 }}>
				<h2 style={{ margin: 0, fontSize: 22 }}>KYC • Aadhaar</h2>
				<p style={{ color: '#6b7280', fontSize: 13 }}>Step 1 of 3</p>

				<label style={{ fontSize: 12, fontWeight: 600 }}>AADHAAR NUMBER</label>
				<input
					value={aadhaar}
					onChange={(e) => {
						setAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12));
						setError('');
					}}
					placeholder="Enter 12-digit Aadhaar"
					style={{ width: '100%', marginTop: 8, padding: 12, borderRadius: 10, border: '1px solid #d1d5db' }}
				/>

				{error && <p style={{ color: '#dc2626', fontSize: 12 }}>{error}</p>}

				<button onClick={onNext} style={{ width: '100%', marginTop: 14, padding: 12, border: 'none', borderRadius: 10, background: '#111827', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
					Next
				</button>
			</div>
		</div>
	);
}
