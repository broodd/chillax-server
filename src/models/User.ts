import bcrypt from 'bcrypt-nodejs';
import crypto from 'crypto';
import mongoose from 'mongoose';

export type IUser = mongoose.Document & {
    email: string;
    password: string;
    passwordResetToken: string;
    passwordResetExpires: Date;

    profile: {
        name: string;
        gender: string;
        location: string;
        website: string;
        picture: string;
    };
    likedPlaylists: string[];
    likedTracks: string[];
    followers: string[];
    followersCount: number;

    comparePassword: comparePasswordFunction;
    gravatar: (size: number) => string;
};

type comparePasswordFunction = (candidatePassword: string, cb: (err: any, isMatch: any) => {}) => void;

const userSchema = new mongoose.Schema({
    email: {
			type: String,
			unique: true,
			required: '{PATH} is required!'
		},
    password: {
			type: String,
			required: '{PATH} is required!',
			// select: false
		},
    passwordResetToken: String,
    passwordResetExpires: Date,

    profile: {
        name: String,
        gender: String,
        location: String,
        website: String,
        picture: String
    },

		likedPlaylists: {
			type: [{
					type:	mongoose.Schema.Types.ObjectId,
					ref: 'Playlist'
			}],
			select: false
		},

		likedTracks: {
			type: [{
        type:	mongoose.Schema.Types.ObjectId,
        ref: 'Track'
			}],
			select: false
		},

    followers: {
			type: [{
        type:	mongoose.Schema.Types.ObjectId,
				ref: 'User',
			}],
			select: false
		}
}, {
	toObject: { virtuals: true },
	toJSON: { virtuals: true },
	timestamps: true 
});

userSchema.virtual('followersCount', {
	ref: 'User',
	localField: 'followers',
	foreignField: '_id',
	count: true
})


/**
 * Password hash middleware.
 */
userSchema.pre('save', async function (next) {
    const user = this as IUser;
    if (!user.isModified('password')) {
        return next();
    }
    bcrypt.genSalt(10, (err, salt) => {
        if (err) { return next(err); }
        bcrypt.hash(user.password, salt, undefined, (err: mongoose.Error, hash) => {
            if (err) { return next(err); }
            user.password = hash;
            next();
        });
    });
});

const comparePassword: comparePasswordFunction = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, (err: mongoose.Error, isMatch: boolean) => {
        cb(err, isMatch);
    });
};

userSchema.methods.comparePassword = comparePassword;

/**
 * Helper method for getting user's gravatar.
 */
userSchema.methods.gravatar = function (size: number = 200) {
    if (!this.email) {
        return `https://gravatar.com/avatar/?s=${size}&d=retro`;
    }
    const md5 = crypto.createHash('md5').update(this.email).digest('hex');
    return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};

export const User = mongoose.model<IUser>('User', userSchema);
