import 'mocha';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { TUser } from '../src/types/TUser';
import redisDb from '../src/bot/redis-db';
import { TPhone } from '../src/types/TPhone';

chai.use(chaiAsPromised);

const expect = chai.expect;

// A test user
const testUser: TUser = {
  id: Number.MAX_SAFE_INTEGER,
  isAdmin: false,
  firstName: 'testName',
  lastName: 'testLastName',
  userName: 'testUserName',
  date: Date.now(),
  languageCode: 'en',
};

// A test phone
const testPhone: TPhone = {
  id: Number.MAX_SAFE_INTEGER.toString(),
  department: 'TestDepartment',
  name: 'testName',
  phone: '0-00',
};

const testBirthday = {
  id: Number.MAX_SAFE_INTEGER.toString(),
  date: new Date(1982, 5, 21).toString(),
  day: 21,
  month: 5,
  year: 1982,
  name: 'Test Name',
};

const NOT_EXISTING_DATA_ID = Number.MAX_SAFE_INTEGER - 1;

describe('Redis', function () {
  describe('User manipulating', function () {
    it('should save user into redis', function () {
      return expect(redisDb.saveUser(testUser)).to.eventually.equal(0 || 1);
    });
    it('should get a user by id', function () {
      return expect(redisDb.getUserById(testUser.id)).to.eventually.deep.equal(testUser);
    });
    it('should get null for not existing user', function () {
      return expect(redisDb.getUserById(NOT_EXISTING_DATA_ID)).to.eventually.equal(null);
    });
    it('should get user and prove that they are not admin', function () {
      return expect(redisDb.getUserById(testUser.id)).to.eventually.have.property('isAdmin').equal(false);
    });
    it('should get the array of all users', function () {
      return expect(redisDb.getUsers()).to.eventually.include.deep.members([testUser]);
    });
    it('should make user an admin', function () {
      return expect(redisDb.makeUserAdmin(testUser.id)).to.eventually.be.true;
    });
    it('should get false attempting to make not existing user admin', function () {
      return expect(redisDb.makeUserAdmin(NOT_EXISTING_DATA_ID)).to.eventually.be.false;
    });
    it('should delete the test user from redis', function () {
      return expect(redisDb.deleteUserById(testUser.id)).to.eventually.equal(1);
    });
  });

  describe('Phone manipulating', function () {
    it('should save phone into redis', function () {
      return expect(redisDb.savePhone(testPhone)).to.eventually.equal(0 || 1);
    });
    it('should get a phone by id', function () {
      return expect(redisDb.getPhoneById(testPhone.id)).to.eventually.deep.equal(testPhone);
    });
    it('should get null for not existing phone', function () {
      return expect(redisDb.getPhoneById(NOT_EXISTING_DATA_ID.toString())).to.eventually.equal(null);
    });
    it('should get the array of all phones', function () {
      return expect(redisDb.getPhones()).to.eventually.include.deep.members([testPhone]);
    });
    it('should delete the test phone from redis', function () {
      return expect(redisDb.deletePhoneById(testPhone.id)).to.eventually.equal(1);
    });
  });

  describe('Birthday manipulating', function () {
    it('should save birthday record into redis', function () {
      return expect(redisDb.saveBirthday(testBirthday)).to.eventually.equal(0 || 1);
    });
    it('should get a birthday record by id', function () {
      return expect(redisDb.getBirthdayById(testBirthday.id)).to.eventually.deep.equal(testBirthday);
    });
    it('should get null for not existing birthday record', function () {
      return expect(redisDb.getBirthdayById(NOT_EXISTING_DATA_ID.toString())).to.eventually.equal(null);
    });
    it('should get the array of all birthday records', function () {
      return expect(redisDb.getBirthdays()).to.eventually.include.deep.members([testBirthday]);
    });
    it('should delete the test birthday from redis', function () {
      return expect(redisDb.deleteBirthdayById(testBirthday.id)).to.eventually.equal(1);
    });
  });
});
