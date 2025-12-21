import Image from 'next/image';
import './SocialMedia.css';

const SocialMedia = () => {
    return (
        <div className="social-media-section">
            <h2 className="section-title">Follow Us</h2>
            <div className="social-icons">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                    <Image
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/1200px-Facebook_Logo_%282019%29.png"
                        alt="Facebook"
                        width={40}
                        height={40}
                    />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                    <Image
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Logo_of_Twitter.svg/512px-Logo_of_Twitter.svg.png"
                        alt="Twitter"
                        width={40}
                        height={40}
                    />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                    <Image
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/132px-Instagram_logo_2016.svg.png"
                        alt="Instagram"
                        width={40}
                        height={40}
                    />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                    <Image
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/1024px-YouTube_full-color_icon_%282017%29.svg.png"
                        alt="YouTube"
                        width={40}
                        height={40}
                    />
                </a>
            </div>
        </div>
    );
};

export default SocialMedia;
