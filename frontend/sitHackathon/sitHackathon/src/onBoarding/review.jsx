import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { kycApi } from '../lib/api';

export default function KycReviewStep() {
	const navigate = useNavigate();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState('');

	const data = useMemo(
		() => ({
			aadhaar_number: localStorage.getItem('kyc_aadhaar') || '',
			pan_number: localStorage.getItem('kyc_pan') || '',
			gst_number: localStorage.getItem('kyc_gst') || '',
		}),
		[],
	);

	const onSubmit = async () => {
		if (!data.aadhaar_number || !data.pan_number || !data.gst_number) {
			setError('Missing KYC fields. Please complete previous steps.');
			return;
		}

		setError('');
		setIsSubmitting(true);

		try {
			await kycApi.onboard(data);
			localStorage.removeItem('kyc_aadhaar');
			localStorage.removeItem('kyc_pan');
			localStorage.removeItem('kyc_gst');
			navigate('/dashboard');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to submit KYC.');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div style={{ minHeight: '100vh', background: '#f0eaeae1', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
			<div style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 16, padding: 22 }}>
				<h2 style={{ margin: 0, fontSize: 22 }}>KYC • Review</h2>
				<p style={{ color: '#6b7280', fontSize: 13 }}>Step 3 of 3</p>

				<div style={{ fontSize: 14, lineHeight: 1.8 }}>
					<div><strong>Aadhaar:</strong> {data.aadhaar_number}</div>
					<div><strong>PAN:</strong> {data.pan_number}</div>
					<div><strong>GST:</strong> {data.gst_number}</div>
				</div>

				{error && <p style={{ color: '#dc2626', fontSize: 12 }}>{error}</p>}

				<div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
					<button onClick={() => navigate('/onboarding/gst')} disabled={isSubmitting} style={{ flex: 1, padding: 12, borderRadius: 10, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>
						Back
					</button>
					<button onClick={onSubmit} disabled={isSubmitting} style={{ flex: 1, padding: 12, border: 'none', borderRadius: 10, background: '#111827', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
						{isSubmitting ? 'Submitting...' : 'Submit KYC'}
					</button>
				</div>
			</div>
		</div>
	);
}
