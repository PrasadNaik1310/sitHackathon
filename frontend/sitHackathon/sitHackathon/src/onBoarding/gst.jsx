import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function GstStep() {
	const navigate = useNavigate();
	const [pan, setPan] = useState(localStorage.getItem('kyc_pan') || '');
	const [gst, setGst] = useState(localStorage.getItem('kyc_gst') || '');
	const [error, setError] = useState('');

	const onNext = () => {
		const panTrimmed = pan.trim().toUpperCase();
		const gstTrimmed = gst.trim().toUpperCase();

		if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panTrimmed)) {
			setError('Please enter a valid PAN number.');
			return;
		}

		if (!/^[0-9A-Z]{15}$/.test(gstTrimmed)) {
			setError('Please enter a valid 15-character GST number.');
			return;
		}

		localStorage.setItem('kyc_pan', panTrimmed);
		localStorage.setItem('kyc_gst', gstTrimmed);
		navigate('/onboarding/review');
	};

	return (
		<div style={{ minHeight: '100vh', background: '#f0eaeae1', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
			<div style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 16, padding: 22 }}>
				<h2 style={{ margin: 0, fontSize: 22 }}>KYC • PAN & GST</h2>
				<p style={{ color: '#6b7280', fontSize: 13 }}>Step 2 of 3</p>

				<label style={{ fontSize: 12, fontWeight: 600 }}>PAN NUMBER</label>
				<input
					value={pan}
					onChange={(e) => {
						setPan(e.target.value.toUpperCase());
						setError('');
					}}
					placeholder="ABCDE1234F"
					style={{ width: '100%', marginTop: 8, marginBottom: 12, padding: 12, borderRadius: 10, border: '1px solid #d1d5db' }}
				/>

				<label style={{ fontSize: 12, fontWeight: 600 }}>GST NUMBER</label>
				<input
					value={gst}
					onChange={(e) => {
						setGst(e.target.value.toUpperCase());
						setError('');
					}}
					placeholder="22ABCDE1234F1Z5"
					style={{ width: '100%', marginTop: 8, padding: 12, borderRadius: 10, border: '1px solid #d1d5db' }}
				/>

				{error && <p style={{ color: '#dc2626', fontSize: 12 }}>{error}</p>}

				<div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
					<button onClick={() => navigate('/onboarding/aadhaar')} style={{ flex: 1, padding: 12, borderRadius: 10, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>
						Back
					</button>
					<button onClick={onNext} style={{ flex: 1, padding: 12, border: 'none', borderRadius: 10, background: '#111827', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
						Next
					</button>
				</div>
			</div>
		</div>
	);
}
