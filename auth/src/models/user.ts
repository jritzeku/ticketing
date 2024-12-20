import mongoose from 'mongoose'
import { Password } from '../services/password'

//interface that describes properties required to create new user
interface UserAttrs {
  email: string
  password: string
}

//interface that describes properties User model has
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc
}

//interface that describes the properties User Document has
interface UserDoc extends mongoose.Document {
  email: string
  password: string
  updatedAt: string
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },

  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id
        delete ret._id, delete ret.password, delete ret.__v
      },
    },
  }
)

userSchema.pre('save', async function (done) {
  //re-hash ONLY if password was modified
  if (this.isModified('password')) {
    const hashed = await Password.toHash(this.get('password'))
    this.set('password', hashed)
  }
  done()
})

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs)
}

const User = mongoose.model<UserDoc, UserModel>('User', userSchema)

export { User }
